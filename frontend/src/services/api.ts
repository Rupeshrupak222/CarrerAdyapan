import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
