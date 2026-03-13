import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
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
  signup:         (data) => api.post('/auth/signup', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// ── Discussions ─────────────────────────────────────
export const discussionsAPI = {
  getAll:      (params) => api.get('/discussions', { params }),
  getById:     (id)     => api.get(`/discussions/${id}`),
  create:      (data)   => api.post('/discussions', data),
  delete:      (id)     => api.delete(`/discussions/${id}`),
  like:        (id)     => api.post(`/discussions/${id}/like`),
  bookmark:    (id)     => api.post(`/discussions/${id}/bookmark`),
  getBookmarks:()       => api.get('/discussions/bookmarks/me'),
};

// ── Replies ─────────────────────────────────────────
export const repliesAPI = {
  create: (discussionId, content) => api.post(`/replies/${discussionId}`, { content }),
  delete: (replyId)               => api.delete(`/replies/${replyId}`),
};

// ── Messages (DMs) ──────────────────────────────────
export const messagesAPI = {
  getConversations: ()           => api.get('/messages/conversations'),
  getUsers:         (q)          => api.get('/messages/users', { params: { q } }),
  getMessages:      (userId)     => api.get(`/messages/${userId}`),
  sendMessage:      (userId, content) => api.post(`/messages/${userId}`, { content }),
};

export default api;
