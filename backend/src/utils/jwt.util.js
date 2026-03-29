const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

/**
 * Sign a payload and return a JWT string.
 * @param {object} payload
 * @returns {string} token
 */
const sign = (payload) =>
  jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

/**
 * Verify a JWT and return its decoded payload.
 * Throws JsonWebTokenError | TokenExpiredError on failure.
 * @param {string} token
 * @returns {object} decoded payload
 */
const verify = (token) => jwt.verify(token, jwtConfig.secret);

/**
 * Decode without verification (useful for logging / debugging only).
 * @param {string} token
 * @returns {object|null}
 */
const decode = (token) => jwt.decode(token);

module.exports = { sign, verify, decode };