import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('paywave_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('paywave_token');
      localStorage.removeItem('paywave_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ─── Wallet ─────────────────────────────────────────
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  deposit: (data) => api.post('/wallet/deposit', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
};

// ─── Transactions ───────────────────────────────────
export const transactionAPI = {
  sendMoney: (data) => api.post('/transactions/send', data),
  getTransactions: (params) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
};

// ─── Users ──────────────────────────────────────────
export const userAPI = {
  searchUsers: (q) => api.get('/users/search', { params: { q } }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Money Requests ─────────────────────────────────
export const requestAPI = {
  createRequest: (data) => api.post('/requests', data),
  getRequests: (params) => api.get('/requests', { params }),
  acceptRequest: (id) => api.put(`/requests/${id}/accept`),
  rejectRequest: (id) => api.put(`/requests/${id}/reject`),
  cancelRequest: (id) => api.put(`/requests/${id}/cancel`),
};

// ─── Notifications ──────────────────────────────────
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// ─── Admin ──────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/admin/users/${id}/unblock`),
  freezeWallet: (id) => api.put(`/admin/wallets/${id}/freeze`),
  unfreezeWallet: (id) => api.put(`/admin/wallets/${id}/unfreeze`),
  getAllTransactions: (params) => api.get('/admin/transactions', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  createAdmin: (data) => api.post('/admin/create-admin', data),
};

export default api;
