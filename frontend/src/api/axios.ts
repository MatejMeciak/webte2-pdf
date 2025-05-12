import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  headers: {
    'X-Source-Type': 'FRONTEND',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api;