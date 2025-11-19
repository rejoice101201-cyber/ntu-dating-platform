import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Log API URL in development to help debug
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to create FormData requests without Content-Type header
// (browser will set it automatically with boundary)
const apiFormData = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we actually got a response (not network error)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if we're not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
    } else if (!error.response) {
      // Network error or API not available
      console.error('API Error:', error.message);
      console.error('API URL:', API_URL);
      // Don't redirect on network errors, let the component handle it
    }
    return Promise.reject(error);
  }
);

export default api;

