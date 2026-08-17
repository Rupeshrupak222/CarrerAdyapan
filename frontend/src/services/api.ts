import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Centralized Production API Base URL configuration.
 * 
 * Production (Vercel / live domain):
 * Uses VITE_API_URL if defined; otherwise automatically resolves to:
 * https://adyapan-hiring-backend.onrender.com/api
 * 
 * Local Development:
 * Uses VITE_API_URL or defaults to http://localhost:5000/api when on localhost/127.0.0.1.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  // 1. Check if running in browser on a production / non-localhost domain (e.g. *.vercel.app)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host === '::1';

    if (!isLocalhost) {
      if (envUrl && !envUrl.includes('localhost')) {
        let cleanUrl = envUrl.replace(/\/+$/, '');
        if (!cleanUrl.endsWith('/api')) cleanUrl = `${cleanUrl}/api`;
        return cleanUrl;
      }
      return 'https://adyapan-hiring-backend.onrender.com/api';
    }
  }

  // 2. Production build fallback
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    if (envUrl && !envUrl.includes('localhost')) {
      let cleanUrl = envUrl.replace(/\/+$/, '');
      if (!cleanUrl.endsWith('/api')) cleanUrl = `${cleanUrl}/api`;
      return cleanUrl;
    }
    return 'https://adyapan-hiring-backend.onrender.com/api';
  }

  // 3. Local development fallback
  if (envUrl) {
    let cleanUrl = envUrl.replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api')) cleanUrl = `${cleanUrl}/api`;
    return cleanUrl;
  }

  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized - Token expired or invalid, clearing local session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;
