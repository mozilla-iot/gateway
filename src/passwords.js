/**
 * Password utilities.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const bcrypt = require('bcryptjs');
const config = require('config');

let rounds;
if (config.has('bcryptRounds')) {
  rounds = config.get('bcryptRounds');
}

module.exports = {
  /**
   * Hash a password asynchronously
   * @param {String} password
   * @return {Promise<String>} hashed password
   */
  hash: function(password) {
    return bcrypt.hash(password, rounds);
  },

  /**
   * Hash a password synchronously.
   * WARNING: This will block for a very long time
   *
   * @param {String} password
   * @return {String} hashed password
   */
  hashSync: function(password) {
    return bcrypt.hashSync(password, rounds);
  },

  /**
   * Compare two password hashes asynchronously
   * @param {String} passwordText - a plain text password
   * @param {String} passwordHash - the expected hash
   * @return {Promise<boolean>} If the hashes are equal
   */
  compare: function(passwordText, passwordHash) {
    return bcrypt.compare(passwordText, passwordHash);
  },

  /**
   * Compare two password hashes
   * @param {String} passwordText - a plain text password
   * @param {String} passwordHash - the expected hash
   * @return {boolean} If the hashes are equal
   */
  compareSync: function(passwordText, passwordHash) {
    return bcrypt.compareSync(passwordText, passwordHash);
  }
};
