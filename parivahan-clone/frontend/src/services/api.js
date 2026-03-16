import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parivahanToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('parivahanToken');
      localStorage.removeItem('parivahanUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

// ─── Services ────────────────────────────────────────
export const servicesAPI = {
  getAll:   (category) => api.get('/services', { params: category ? { category } : {} }),
  getById:  (id)       => api.get(`/services/${id}`),
};

// ─── Applications ────────────────────────────────────
export const applicationsAPI = {
  apply:          (data)      => api.post('/applications/apply', data),
  getUserApps:    ()          => api.get('/applications/user'),
  getByNumber:    (appNum)    => api.get(`/applications/status/${appNum}`),
};

export default api;
