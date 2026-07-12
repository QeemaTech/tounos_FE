import { createContext } from 'react';
import useAuthStore from '../store/authStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={null}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const admin = useAuthStore((s) => s.admin);
  const token = useAuthStore((s) => s.token);
  const permissions = useAuthStore((s) => s.permissions);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const isSuperAdminFn = useAuthStore((s) => s.isSuperAdmin);

  const role = typeof admin?.role === 'string' ? admin.role : admin?.role?.name;
  const isSuperAdmin = role === 'super_admin';
  const branchIds = isSuperAdmin ? [] : admin?.branchIds || [];

  return {
    user: admin,
    token,
    permissions,
    login,
    logout,
    hasPermission,
    isSuperAdmin,
    isSuperAdminFn,
    branchIds,
    defaultBranchId: !isSuperAdmin && branchIds.length === 1 ? branchIds[0] : null,
    isAuthenticated: !!admin && !!token,
  };
}
