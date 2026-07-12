import { useAuth } from '../../hooks/useAuth';

/**
 * @param {string|string[]} [permission] - permission code(s); any match allows access
 * @param {boolean} [superAdminOnly]
 */
export default function PermissionGuard({
  permission,
  superAdminOnly,
  requireAdmin,
  children,
  fallback = null,
}) {
  const { isSuperAdmin, hasPermission } = useAuth();

  if (superAdminOnly || requireAdmin) {
    const superAdmin = typeof isSuperAdmin === 'function' ? isSuperAdmin() : !!isSuperAdmin;
    if (!superAdmin) return fallback;
    return children;
  }

  if (permission) {
    const required = Array.isArray(permission) ? permission : [permission];
    const allowed = required.some((p) => hasPermission(p));
    if (!allowed) return fallback;
  }

  return children;
}
