import axios from 'axios';

// Use relative path for Next.js API Routes
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function for FormData requests
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
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      // Don't redirect if already on login/register pages or during rehydration
      if (currentPath && 
          !currentPath.includes('/auth/login') && 
          !currentPath.includes('/auth/register') &&
          !currentPath.includes('/auth/forgot')) {
        localStorage.removeItem('token');
        localStorage.removeItem('recentLoginExpiresAt');
        // Use router.push instead of window.location to avoid full page reload
        // But we need to check if we're in a component context
        if (typeof window !== 'undefined') {
          // Only redirect if not already redirecting
          if (!currentPath.startsWith('/auth/')) {
            window.location.href = '/auth/login';
          }
        }
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

