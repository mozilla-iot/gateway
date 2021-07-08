#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;
#[macro_use]
extern crate lazy_static;
extern crate rusqlite;

mod addon;
mod addon_instance;
mod addon_manager;
mod addon_manifest;
mod addon_socket;
mod addon_utils;
mod db;
mod model;
mod process_manager;
mod router;
mod user_config;

use crate::{
    addon_manager::{AddonManager, LoadAddons},
    db::Db,
};
use actix::SystemService;
use rocket::{Build, Rocket};

fn rocket() -> Rocket<Build> {
    rocket::build()
        .manage(Db::new())
        .mount("/", router::routes())
}

#[actix_web::main]
async fn main() {
    actix::spawn(async {
        addon_socket::start().await.expect("Starting addon socket");
    });

    AddonManager::from_registry()
        .send(LoadAddons)
        .await
        .expect("Sending LoadAddons message ");

    rocket()
        .ignite()
        .await
        .expect("Ignite rocket")
        .launch()
        .await
        .expect("Ignite rocket");
}

#[cfg(test)]
mod test {
    extern crate rusty_fork;
    extern crate serial_test;
    use super::*;
    use rocket::{http::Status, local::blocking::Client};
    use rusty_fork::rusty_fork_test;
    use serial_test::serial;
    use std::{env, fs};

    fn setup() {
        let dir = env::temp_dir().join(".webthingsio");
        fs::remove_dir_all(&dir); // We really don't want to handle this result, since we don't care if the directory never existed
        env::set_var("WEBTHINGS_HOME", dir);
    }

    rusty_fork_test! {
        #[test]
        #[serial]
        fn get_things() {
            setup();
            let client = Client::tracked(rocket()).expect("Valid rocket instance");
            let response = client.get("/things").dispatch();
            assert_eq!(response.status(), Status::Ok);
            assert_eq!(response.into_string(), Some("[]".into()));
        }

        #[test]
        #[serial]
        fn get_thing() {
            setup();
            let client = Client::tracked(rocket()).expect("Valid rocket instance");
            let response = client.get("/thing/test").dispatch();
            assert_eq!(response.status(), Status::NotFound);
        }
    }
}
