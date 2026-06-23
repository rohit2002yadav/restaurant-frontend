import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  adminRegister:    (data) => api.post('/api/auth/admin/register/', data),
  customerRegister: (data) => api.post('/api/auth/customer/register/', data),
  verifyOTP:        (data) => api.post('/api/auth/verify-otp/', data),
  login:            (data) => api.post('/api/auth/login/', data),
  resendOTP:        (data) => api.post('/api/auth/resend-otp/', data),
  profile:          ()     => api.get('/api/auth/profile/'),
  refreshToken:     (data) => api.post('/api/auth/token/refresh/', data),
};

export const queueAPI = {
  joinQueue:          (data) => api.post('/api/queue/join-queue/', data),
  getStatus:          (token) => api.get(`/api/queue/queue-status/${token}/`),
  leaveQueue:         (data) => api.post('/api/queue/leave-queue/', data),
  getRestaurantQueue: (id) => api.get(`/api/queue/restaurant-queue/${id}/`),
  staffDashboard:     (id) => api.get(`/api/queue/staff-dashboard/${id}/`),
  callCustomer:       (data) => api.post('/api/queue/call-customer/', data),
  clearTable:         (data) => api.post('/api/queue/clear-table/', data),
};

export const restaurantAPI = {
  getDetail: (id) => api.get(`/api/restaurants/${id}/`),
};

export const orderAPI = {
  getMenu:     (restaurantId) => api.get(`/api/orders/menu/${restaurantId}/`),
  createOrder: (data) => api.post('/api/orders/create/', data),
  getOrder:    (id) => api.get(`/api/orders/${id}/`),
};

export default api;
