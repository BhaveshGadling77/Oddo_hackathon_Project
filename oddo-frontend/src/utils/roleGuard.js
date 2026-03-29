/**
 * roleGuard — returns true if the user's role satisfies the required roles.
 * Usage: roleGuard(user, "admin")  or  roleGuard(user, ["admin","manager"])
 */
export function roleGuard(user, ...requiredRoles) {
  if (!user) return false;
  const roles = requiredRoles.flat();
  return roles.includes(user.role);
}

/**
 * RoleGate — React component wrapper.
 * <RoleGate roles={["admin"]}> ... </RoleGate>
 */
export function RoleGate({ user, roles, children, fallback = null }) {
  if (roleGuard(user, roles)) return children;
  return fallback;
}
