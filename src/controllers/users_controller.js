/**
 * Users Controller.
 *
 * Manages HTTP requests to /users.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const PromiseRouter = require('express-promise-router');
const Passwords = require('../passwords');
const Users = require('../models/users');
const JSONWebToken = require('../models/jsonwebtoken');
const auth = require('../jwt-middleware')();

const UsersController = PromiseRouter();

/**
 * Get the count of users.
 *
 * NOTE: This is temporary while we figure out mutli user UI.
 */
UsersController.get('/count', async (request, response) => {
  const count = await Users.getCount();
  return response.status(200).send({ count });
});

/**
 * Get a user.
 */
UsersController.get('/info', auth, async (request, response) => {
  const user = await Users.getUserById(request.jwt.user);
  // This should never happen if we auth'ed the JWT the user row should
  // be present barring any bugs/races.
  if (!user) {
    response.sendStatus(500);
    return;
  }
  response.status(200).json(user.getDescription());
});

/**
 * Create a user
 */
UsersController.post('/', async (request, response) => {
  const body = request.body;

  if (!body || !body.email || !body.password) {
    response.status(400).send('User requires email and password.');
    return;
  }

  const count = await Users.getCount();
  if (count > 0) {
    response.status(400).send('Gateway user already created.');
    return;
  }

  // TODO: user facing errors...
  const hash = await Passwords.hash(body.password);
  const user = await Users.createUser(body.email, hash, body.name);
  const jwt = await JSONWebToken.issueToken(user.id);

  response.send({
    jwt,
  });
});

/**
 * Edit a user
 */
UsersController.put('/:userId', async (request, response) => {
  const user = await Users.getUserById(request.params.userId);

  if (!user) {
    response.sendStatus(500);
    return;
  }

  const body = request.body;
  if (!body || !body.email || !body.password) {
    response.status(400).send('User requires email and password.');
    return;
  }

  const passwordMatch = await Passwords.compare(body.password, user.password);
  if (!passwordMatch) {
    response.status(400).send('Passwords do not match.');
    return;
  }

  if (body.newPassword) {
    user.password = await Passwords.hash(body.newPassword);
  }

  user.email = body.email;
  user.name = body.name;

  await Users.editUser(user);
  response.sendStatus(200);
});

/**
 * Delete a user
 */
UsersController.delete('/:userId', async (request, response) => {
  const userId = request.params.userId;

  await Users.deleteUser(userId);
  response.sendStatus(200);
});

module.exports = UsersController;
