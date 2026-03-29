const { verify } = require('../utils/jwt.util');
const UserModel = require('../models/user.model');
const { error } = require('../utils/response.util');

/**
 * Verifies the Bearer JWT from the Authorization header.
 * Attaches the full user object to req.user on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verify(token);

    const user = await UserModel.findById(payload.id);
    if (!user) {
      return error(res, 'User not found', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401);
    }
    return error(res, 'Invalid token', 401);
  }
};

module.exports = { authenticate };