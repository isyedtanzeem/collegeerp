import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('college_erp_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite refresh loops for login or refresh-token calls
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('college_erp_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          if (res.data.success && res.data.token) {
            localStorage.setItem('college_erp_token', res.data.token);
            if (res.data.refreshToken) {
              localStorage.setItem('college_erp_refresh_token', res.data.refreshToken);
            }
            if (res.data.user) {
              localStorage.setItem('college_erp_user', JSON.stringify(res.data.user));
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        } catch {
          // Clear credentials on refresh failure
          localStorage.removeItem('college_erp_token');
          localStorage.removeItem('college_erp_refresh_token');
          localStorage.removeItem('college_erp_user');
          window.dispatchEvent(new Event('college_erp_unauthorized'));
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        localStorage.removeItem('college_erp_token');
        localStorage.removeItem('college_erp_refresh_token');
        localStorage.removeItem('college_erp_user');
        window.dispatchEvent(new Event('college_erp_unauthorized'));
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
