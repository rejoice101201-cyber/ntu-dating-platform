import axios from 'axios';
import type { AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  notes?: string;
  is_favorite: boolean;
  user_id: number;
  created_at: string;
}

export interface CreateLocationRequest {
  name: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  lat?: number;
  lng?: number;
  address?: string;
  rating?: number;
  notes?: string;
  is_favorite?: boolean;
}

export interface SearchPlacesRequest {
  query: string;
  lat: number;
  lng: number;
  radius?: number;
}

export interface PlaceResult {
  name: string;
  lat: number;
  lng: number;
  address: string;
  place_id: string;
  rating?: number;
}

export interface SearchPlacesResponse {
  places: PlaceResult[];
  total: number;
  query: string;
  location: { lat: number; lng: number };
  radius: number;
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<{ message: string; userId: number }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

// Locations API
export const locationsAPI = {
  getAll: async (): Promise<Location[]> => {
    const response: AxiosResponse<Location[]> = await api.get('/api/locations');
    return response.data;
  },

  getById: async (id: number): Promise<Location> => {
    const response: AxiosResponse<Location> = await api.get(`/api/locations/${id}`);
    return response.data;
  },

  create: async (location: CreateLocationRequest): Promise<Location> => {
    const response: AxiosResponse<Location> = await api.post('/api/locations', location);
    return response.data;
  },

  update: async (id: number, updates: UpdateLocationRequest): Promise<Location> => {
    const response: AxiosResponse<Location> = await api.put(`/api/locations/${id}`, updates);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/api/locations/${id}`);
    return response.data;
  },

  toggleFavorite: async (id: string): Promise<Location> => {
    console.log('🌐 API 調用: PATCH /api/locations/' + id + '/favorite');
    const response: AxiosResponse<Location> = await api.patch(`/api/locations/${id}/favorite`);
    console.log('✅ API 響應:', response.data);
    return response.data;
  },
};

// Search API
export const searchAPI = {
  searchPlaces: async (params: SearchPlacesRequest): Promise<SearchPlacesResponse> => {
    const response: AxiosResponse<SearchPlacesResponse> = await api.get('/api/search/places', {
      params: {
        query: params.query,
        lat: params.lat,
        lng: params.lng,
        radius: params.radius || 1000,
      },
    });
    return response.data;
  },

  searchNearby: async (lat: number, lng: number, radius = 1000): Promise<SearchPlacesResponse> => {
    const response: AxiosResponse<SearchPlacesResponse> = await api.get('/api/search/places/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string; version: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
