import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hh_token');
      localStorage.removeItem('hh_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────
export const authAPI = {
  signup:             (data)  => api.post('/auth/signup', data),
  login:              (data)  => api.post('/auth/login', data),
  getMe:              ()      => api.get('/auth/me'),
  updateProfile:      (data)  => api.put('/auth/profile', data),
  changePassword:     (data)  => api.put('/auth/password', data),
  verifyEmail:        (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: ()      => api.post('/auth/resend-verification'),
  forgotPassword:     (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:      (data)  => api.post('/auth/reset-password', data),
  uploadAvatar:       (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ── Discussions ─────────────────────────────────────
export const discussionsAPI = {
  getAll:       (params) => api.get('/discussions', { params }),
  getById:      (id)     => api.get(`/discussions/${id}`),
  create:       (data)   => api.post('/discussions', data),
  update:       (id, data) => api.put(`/discussions/${id}`, data),
  delete:       (id)     => api.delete(`/discussions/${id}`),
  like:         (id)     => api.post(`/discussions/${id}/like`),
  dislike:      (id)     => api.post(`/discussions/${id}/dislike`),
  bookmark:     (id)     => api.post(`/discussions/${id}/bookmark`),
  getBookmarks: ()       => api.get('/discussions/bookmarks/me'),
  searchUsers:  (q)      => api.get('/discussions/search/users', { params: { q } }),
};

// ── Replies ─────────────────────────────────────────
export const repliesAPI = {
  create:  (discussionId, content, replyToId) =>
    api.post(`/replies/${discussionId}`, { content, replyToId }),
  like:    (replyId) => api.post(`/replies/${replyId}/like`),
  dislike: (replyId) => api.post(`/replies/${replyId}/dislike`),
  delete:  (replyId) => api.delete(`/replies/${replyId}`),
};

// ── Messages (DMs) ──────────────────────────────────
export const messagesAPI = {
  getConversations: ()                => api.get('/messages/conversations'),
  getUsers:         (q)               => api.get('/messages/users', { params: { q } }),
  getMessages:      (userId)          => api.get(`/messages/${userId}`),
  sendMessage:      (userId, content) => api.post(`/messages/${userId}`, { content }),
};

// ── Notifications ────────────────────────────────────
export const notificationsAPI = {
  getAll:      ()   => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()   => api.patch('/notifications/read-all'),
  delete:      (id) => api.delete(`/notifications/${id}`),
};

// ── Admin ────────────────────────────────────────────
export const adminAPI = {
  getPendingVerifications: () => api.get('/admin/verifications'),
  approveDoctor: (id)  => api.post(`/admin/verify/${id}/approve`),
  rejectDoctor:  (id)  => api.post(`/admin/verify/${id}/reject`),
};

// ── Doctor ───────────────────────────────────────────
export const doctorAPI = {
  requestVerification: (data) => api.post('/doctor/verify-request', data),
};

// ── Reports ──────────────────────────────────────────
export const reportsAPI = {
  create:  (data) => api.post('/reports', data),
  getAll:  ()     => api.get('/reports'),
  resolve: (id)   => api.patch(`/reports/${id}`, { status: 'resolved' }),
  dismiss: (id)   => api.patch(`/reports/${id}`, { status: 'dismissed' }),
};

export default api;