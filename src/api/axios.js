import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-retry once on 401 by refreshing the access token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh });
        localStorage.setItem('accessToken', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  adminRegister:    (data) => api.post('/api/auth/admin/register/', data),
  customerRegister: (data) => api.post('/api/auth/customer/register/', data),
  verifyOTP:        (data) => api.post('/api/auth/verify-otp/', data),
  login:            (data) => api.post('/api/auth/login/', data),
  resendOTP:        (data) => api.post('/api/auth/resend-otp/', data),
  profile:          ()     => api.get('/api/auth/profile/'),
  refreshToken:     (data) => api.post('/api/auth/token/refresh/', data),
  requestPasswordReset: (data) => api.post('/api/auth/request-password-reset/', data),
  resetPassword:        (data) => api.post('/api/auth/reset-password/', data),
};

export const queueAPI = {
  joinQueue:      (data)  => api.post('/api/queue/join-queue/', data),
  getStatus:      (token) => api.get(`/api/queue/queue-status/${token}/`),
  leaveQueue:     (data)  => api.post('/api/queue/leave-queue/', data),
  staffDashboard: (id)    => api.get(`/api/queue/staff-dashboard/${id}/`),
  callCustomer:   (data)  => api.post('/api/queue/call-customer/', data),
  seatCustomer:   (data)  => api.post('/api/queue/seat-customer/', data),
  clearTable:     (data)  => api.post('/api/queue/clear-table/', data),
  myActiveQueue:  ()      => api.get('/api/queue/my-active-queue/'),
};

export const restaurantAPI = {
  getList:      ()           => api.get('/api/restaurants/'),
  getDetail:    (id)         => api.get(`/api/restaurants/${id}/`),
  getTables:    (id)         => api.get(`/api/restaurants/${id}/tables/`),
  bulkCreate:   (id, tables) => api.post(`/api/restaurants/${id}/tables/bulk-create/`, { tables }),
  updateTable:  (tableId, capacity) => api.patch(`/api/restaurants/tables/${tableId}/`, { capacity }),
  deleteTable:  (tableId)   => api.delete(`/api/restaurants/tables/${tableId}/`),
};

export const notificationsAPI = {
  submitFeedback: (data) => api.post('/api/notifications/feedback/', data),
};

export default api;
