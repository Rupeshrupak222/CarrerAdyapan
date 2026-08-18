import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export const RENDER_BACKEND_API_URL = 'https://adyapan-hiring-backend.onrender.com/api';

const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  if (import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
    return RENDER_BACKEND_API_URL;
  }
  return RENDER_BACKEND_API_URL;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(' Token added to request');
    } else {
      console.log(' No token found');
    }

    console.log(' API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error(' Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(' Response Error:', error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      console.log(' Unauthorized - Token expired or invalid, clearing local session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;
