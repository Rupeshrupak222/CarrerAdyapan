import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to request');
    } else {
      console.log('❌ No token found');
    }

    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Auto logout DISABLE karein
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);

    // ✅ 401 pe auto logout nahi karenge - sirf error return karenge
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Token expired or invalid');
      // ✅ Comment out auto redirect
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;