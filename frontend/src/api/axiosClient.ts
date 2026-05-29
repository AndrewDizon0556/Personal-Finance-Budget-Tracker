import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto sign-out when an authenticated request is rejected (expired or revoked token).
// Credential failures on the auth endpoints are left to the forms to handle.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    const isAuthEntry = url.includes('/api/auth/login') || url.includes('/api/auth/register');
    const hadToken = !!localStorage.getItem('token');

    if (status === 401 && hadToken && !isAuthEntry) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
