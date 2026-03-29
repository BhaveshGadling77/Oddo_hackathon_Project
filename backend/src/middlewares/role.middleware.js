const { error } = require('../utils/response.util');

/**
 * Role hierarchy: admin > manager > employee
 * Usage:  router.get('/admin-only', authenticate, requireRole('admin'), handler)
 *         router.get('/mgr-up',     authenticate, requireRole('manager'), handler)
 */
const ROLE_RANK = { employee: 1, manager: 2, admin: 3 };

/**
 * Allows access if the user's role rank is >= the required role rank.
 * e.g. requireRole('manager') allows both manager and admin.
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return error(res, 'Unauthenticated', 401);
  }

  const userRank = ROLE_RANK[req.user.role] ?? 0;
  const minRequired = Math.min(...allowedRoles.map((r) => ROLE_RANK[r] ?? 99));

  if (userRank < minRequired) {
    return error(res, 'Forbidden: insufficient permissions', 403);
  }

  next();
};

/**
 * Strict version — only the exact role(s) listed are allowed.
 */
const requireExactRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return error(res, 'Forbidden: insufficient permissions', 403);
  }
  next();
};

module.exports = { requireRole, requireExactRole };