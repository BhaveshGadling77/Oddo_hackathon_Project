const { verify } = require('../utils/jwt.util');
const UserModel = require('../models/user.model');
const { error } = require('../utils/response.util');

/**
 * Authenticate
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


/**
 * Role Guard
 */
const roleGuard = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, 'Access denied', 403);
    }
    next();
  };
};


/**
 * Require Company
 */
const requireCompany = (req, res, next) => {
  if (!req.user.company_id) {
    return error(res, 'Company required', 400);
  }
  next();
};


module.exports = {
  authenticate,
  roleGuard,
  requireCompany
};