import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let the browser set the correct Content-Type + boundary for FormData.
  // For everything else, default to JSON.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      
      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const { data } = await axios.post(`${API_URL}/auth/admin/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = data.data;

          localStorage.setItem('admin_token', accessToken);
          localStorage.setItem('admin_refresh_token', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          console.error('Session refresh failed:', refreshError);
          clearSessionAndRedirect();
        }
      } else {
        // No refresh token available, session is definitely dead
        clearSessionAndRedirect();
      }
    }
    return Promise.reject(error);
  }
);

function clearSessionAndRedirect() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_refresh_token');
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_permissions');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export default client;
