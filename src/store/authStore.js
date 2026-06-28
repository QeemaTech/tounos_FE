import { create } from 'zustand';
import { authApi } from '../api/endpoints';

const useAuthStore = create((set, get) => ({
  admin: JSON.parse(localStorage.getItem('admin_user') || 'null'),
  token: localStorage.getItem('admin_token') || null,
  permissions: JSON.parse(localStorage.getItem('admin_permissions') || '[]'),

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const { admin, accessToken, refreshToken, permissions = [] } = data.data;

    localStorage.setItem('admin_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(admin));
    localStorage.setItem('admin_permissions', JSON.stringify(permissions));

    set({ admin, token: accessToken, permissions });
    return admin;
  },

  logout: () => {
    try { authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_permissions');
    set({ admin: null, token: null, permissions: [] });
  },

  hasPermission: (permission) => {
    const { permissions, admin } = get();
    if (admin?.role === 'super_admin' || admin?.role?.name === 'super_admin') return true;
    return permissions.includes(permission);
  },

  isSuperAdmin: () => {
    const { admin } = get();
    return admin?.role === 'super_admin' || admin?.role?.name === 'super_admin';
  },

  get isAuthenticated() {
    return !!get().admin;
  },
}));

export default useAuthStore;
