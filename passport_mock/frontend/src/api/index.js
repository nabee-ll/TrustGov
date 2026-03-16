import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: d => api.post('/auth/login', d),
  register: d => api.post('/auth/register', d),
  verifyOtp: d => api.post('/auth/verify-otp', d),
  me: () => api.get('/auth/me'),
  updateProfile: d => api.put('/auth/profile', d),
};

export const applicationsAPI = {
  getAll: () => api.get('/applications'),
  getOne: arn => api.get(`/applications/${arn}`),
  submit: d => api.post('/applications', d),
  pay: arn => api.post(`/applications/${arn}/pay`),
  calcFee: (serviceType, dispatch = 50) =>
    api.get(`/applications/fees/calculate?serviceType=${encodeURIComponent(serviceType)}&dispatch=${dispatch}`),
};

export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  getSlots: (date, office) => api.get(`/appointments/slots?date=${date}&office=${encodeURIComponent(office)}`),
  book: d => api.post('/appointments', d),
  cancel: id => api.delete(`/appointments/${id}`),
};

export const officesAPI = {
  getAll: params => api.get('/offices', { params }),
  getStates: () => api.get('/offices/states'),
  getOne: id => api.get(`/offices/${id}`),
};

export const trackAPI = {
  track: (arn, dob) => api.get(`/track?arn=${arn}&dob=${dob}`),
};

export const grievancesAPI = {
  submit: d => api.post('/grievances', d),
  track: grn => api.get(`/grievances/track?grn=${grn}`),
};

export default api;
