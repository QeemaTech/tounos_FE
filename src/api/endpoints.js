import client from './client';

function createCrudApi(resource) {
  const base = `/admin/${resource}`;
  return {
    list:    (params) => client.get(base, { params }),
    getById: (id)     => client.get(`${base}/${id}`),
    create:  (data)   => client.post(base, data),
    update:  (id, data) => client.put(`${base}/${id}`, data),
    remove:  (id)     => client.delete(`${base}/${id}`),
  };
}

/* ── Auth ── */
export const authApi = {
  login:          (data) => client.post('/auth/admin/login', data),
  refreshToken:   (refreshToken) => client.post('/auth/admin/refresh-token', { refreshToken }),
  logout:         () => client.post('/auth/admin/logout'),
  forgotPassword: (email) => client.post('/auth/admin/forgot-password', { email }),
  resetPassword:  (data) => client.post('/auth/admin/reset-password', data),
};

/* ── Core Resources ── */
export const membersApi = {
  ...createCrudApi('members'),
  updateStatus: (id, status) => client.patch(`/admin/members/${id}/status`, { status }),
  // Nested Resources
  getSubscriptions: (id) => client.get(`/admin/members/${id}/subscriptions`),
  getBookings:      (id) => client.get(`/admin/members/${id}/bookings`),
  getPayments:      (id) => client.get(`/admin/members/${id}/payments`),
  getInBody:        (id) => client.get(`/admin/inbody/member/${id}`),
  getInBodyProgress: (id) => client.get(`/admin/inbody/member/${id}/progress`),
};

export const branchesApi = {
  ...createCrudApi('branches'),
};

export const trainersApi  = createCrudApi('trainers');
export const therapistsApi = createCrudApi('therapists');

/* ── Services & Classes ── */
export const serviceCategoriesApi = createCrudApi('service-categories');
export const servicesApi    = createCrudApi('services');
export const classesApi     = createCrudApi('classes');
export const schedulesApi   = createCrudApi('schedules');

/* ── Packages & Subscriptions ── */
export const packagesApi = createCrudApi('packages');

export const subscriptionsApi = {
  ...createCrudApi('subscriptions'),
  activate: (id) => client.post(`/admin/subscriptions/${id}/activate`),
  suspend:  (id) => client.post(`/admin/subscriptions/${id}/suspend`),
  cancel:   (id) => client.post(`/admin/subscriptions/${id}/cancel`),
};

/* ── Bookings ── */
export const bookingsApi = {
  ...createCrudApi('bookings'),
  cancel: (id, reason) => client.post(`/admin/bookings/${id}/cancel`, { reason }),
};

/* ── Attendance ── */
export const attendanceApi = {
  ...createCrudApi('attendance'),
  manualCheckIn: (data) => client.post('/admin/attendance/manual', data),
};

/* ── Payments ── */
export const paymentsApi = {
  ...createCrudApi('payments'),
  markPaid: (id) => client.post(`/admin/payments/${id}/mark-paid`),
  refund:   (id) => client.post(`/admin/payments/${id}/refund`),
};

/* ── Orders ── */
export const ordersApi = {
  ...createCrudApi('orders'),
  confirm: (id) => client.post(`/admin/orders/${id}/confirm`),
  cancel:  (id) => client.post(`/admin/orders/${id}/cancel`),
};

/* ── Products ── */
export const productsApi = {
  ...createCrudApi('products'),
  updateStock: (branchId, data) => client.put(`/admin/products/branch/${branchId}`, data),
};

/* ── Promo Codes ── */
export const promoCodesApi = createCrudApi('promo-codes');

/* ── Subscription Freezes ── */
export const freezesApi = {
  ...createCrudApi('subscription-freezes'),
  create: (data) => client.post('/admin/subscription-freezes', data),
  approve: (id) => client.put(`/admin/subscription-freezes/${id}/approve`),
  reject:  (id) => client.put(`/admin/subscription-freezes/${id}/reject`),
  cancel: (id) => client.post(`/admin/subscription-freezes/${id}/cancel`),
};

/* ── Support Tickets ── */
export const supportApi = {
  list:         (params) => client.get('/admin/support', { params }),
  getById:      (id)     => client.get(`/admin/support/${id}`),
  reply:        (id, message) => client.post(`/admin/support/${id}/reply`, { message }),
  updateStatus: (id, status)  => client.patch(`/admin/support/${id}/status`, { status }),
  updatePriority: (id, priority) => client.patch(`/admin/support/${id}/status`, { priority }),
};

/* ── Notifications ── */
export const notificationsApi = {
  ...createCrudApi('notifications'),
  sendToAll: (data) => client.post('/admin/notifications/send-all', data),
};

/* ── Offers ── */
export const offersApi = createCrudApi('offers');

/* ── InBody ── */
export const inbodyApi = {
  ...createCrudApi('inbody'),
  getMemberInBody: (memberId) => client.get(`/admin/inbody/member/${memberId}`),
  getMemberProgress: (memberId) => client.get(`/admin/inbody/member/${memberId}/progress`),
  getMemberInBodyById: (memberId, id) => client.get(`/admin/inbody/member/${memberId}/${id}`),
  createForMember: (memberId, data) => client.post(`/admin/inbody/member/${memberId}`, data),
};

/* ── Admin Users & Roles ── */
export const adminsApi = createCrudApi('admin-users');

export const rolesApi = {
  ...createCrudApi('roles'),
  listPermissions:   () => client.get('/admin/roles/permissions'),
  assignPermissions: (id, permissionIds) => client.put(`/admin/roles/${id}/permissions`, { permissionIds }),
};

/* ── Settings ── */
export const settingsApi = {
  get:        (params) => client.get('/admin/settings', { params }),
  upsert:     (data)   => client.post('/admin/settings', data),
  bulkUpdate: (settings) => client.put('/admin/settings/bulk', { settings }),
};

/* ── Audit Logs ── */
export const auditLogsApi = {
  list: (params) => client.get('/admin/audit-logs', { params }),
};

/* ── Reports ── */
export const reportsApi = {
  dashboard:     (params) => client.get('/admin/reports/dashboard', { params }),
  revenue:       (params) => client.get('/admin/reports/revenue', { params }),
  members:       (params) => client.get('/admin/reports/members', { params }),
  bookings:      (params) => client.get('/admin/reports/bookings', { params }),
  subscriptions: (params) => client.get('/admin/reports/subscriptions', { params }),
  analytics:     (params) => client.get('/admin/analytics', { params }),
};
