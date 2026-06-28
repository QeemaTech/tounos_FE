import { useAuth } from '../../hooks/useAuth';

export default function PermissionGuard({ superAdminOnly, requireAdmin, children, fallback = null }) {
  const { isSuperAdmin } = useAuth();

  // Both `superAdminOnly` and `requireAdmin` mean "super admin only"
  if ((superAdminOnly || requireAdmin) && !isSuperAdmin) return fallback;

  return children;
}
