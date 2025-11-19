import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  birthday: string;
  gender: string;
  location?: string;
  height?: number;
  bio?: string;
  energy: number;
  energyMax: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthday: string;
  gender: 'male' | 'female' | 'other';
  location?: string;
  height?: number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Initialize from localStorage on mount
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !get().token) {
          // Try to restore user from token
          api.get('/auth/me')
            .then(response => {
              set({ user: response.data.user, token: storedToken });
            })
            .catch(() => {
              // Token invalid, clear it
              localStorage.removeItem('token');
            });
        }
      }

      return {
        user: null,
        token: null,
        login: async (email: string, password: string) => {
          const response = await api.post('/auth/login', { email, password });
          set({ user: response.data.user, token: response.data.token });
          localStorage.setItem('token', response.data.token);
        },
        register: async (data: RegisterData) => {
          const response = await api.post('/auth/register', data);
          set({ user: response.data.user, token: response.data.token });
          localStorage.setItem('token', response.data.token);
        },
        logout: () => {
          set({ user: null, token: null });
          localStorage.removeItem('token');
        },
        updateUser: (user: User) => {
          set({ user });
        },
      };
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

