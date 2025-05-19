import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Get base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add default headers
    config.headers.set('X-Source-Type', 'FRONTEND');
    
    if (!config.headers.get('Content-Type')) {
      config.headers.set('Content-Type', 'application/json');
    }
    
    // Add authorization token if available
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);


export default api;