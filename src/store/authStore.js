import { create } from 'zustand';
import { authApi } from '../api/endpoints';

function normalizeRole(admin) {
  if (!admin) return null;
  if (typeof admin.role === 'string') return admin.role;
  return admin.role?.name || null;
}

const useAuthStore = create((set, get) => ({
  admin: JSON.parse(localStorage.getItem('admin_user') || 'null'),
  token: localStorage.getItem('admin_token') || null,
  permissions: JSON.parse(localStorage.getItem('admin_permissions') || '[]'),

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const { admin, accessToken, refreshToken, permissions = [] } = data.data;
    const normalizedAdmin = { ...admin, role: normalizeRole(admin) };

    localStorage.setItem('admin_token', accessToken);
    localStorage.setItem('admin_refresh_token', refreshToken);
    localStorage.setItem('admin_user', JSON.stringify(normalizedAdmin));
    localStorage.setItem('admin_permissions', JSON.stringify(permissions));

    set({ admin: normalizedAdmin, token: accessToken, permissions });
    return normalizedAdmin;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore network/auth errors on logout */
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_permissions');
    set({ admin: null, token: null, permissions: [] });
  },

  hasPermission: (permission) => {
    const { permissions, admin } = get();
    const role = normalizeRole(admin);
    if (role === 'super_admin') return true;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  },

  isSuperAdmin: () => normalizeRole(get().admin) === 'super_admin',

  get isAuthenticated() {
    return !!get().token && !!get().admin;
  },
}));

export default useAuthStore;
