import { createContext, useContext } from 'react';
import useAuthStore from '../store/authStore';

// Thin wrapper to maintain backward compatibility with existing components
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
  const isSuperAdmin = admin?.role === 'super_admin' || admin?.role?.name === 'super_admin';

  const branchIds = isSuperAdmin ? [] : admin?.branchIds || [];

  return {
    user: admin,
    token: useAuthStore.getState().token,
    login: useAuthStore.getState().login,
    logout: useAuthStore.getState().logout,
    hasPermission: useAuthStore.getState().hasPermission,
    isSuperAdmin,
    branchIds,
    defaultBranchId: !isSuperAdmin && branchIds.length === 1 ? branchIds[0] : null,
    isAuthenticated: !!admin,
  };
}
