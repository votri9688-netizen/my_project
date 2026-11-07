import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Auto attach token if present in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const fanpageApi = {
  list: () => api.get('/fanpages/'),
  get: (id) => api.get(`/fanpages/${id}`),
  create: (data) => api.post('/fanpages/', data),
  update: (id, data) => api.put(`/fanpages/${id}`, data),
  process: (id, topic) => api.post(`/fanpages/${id}/process${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`),
};

export const reelApi = {
  list: (fanpageId) => api.get(`/reels/${fanpageId ? `?fanpage_id=${fanpageId}` : ''}`),
};

export const authApi = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  me: () => api.get('/auth/me'),
  status: () => api.get('/status'),
};

export default api;
