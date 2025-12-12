import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  userId: string;
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
  login: (identifier: string, password?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

interface RegisterData {
  userId: string;
  email: string;
  password: string;
  name: string;
  birthday: string;
  gender: 'male' | 'female' | 'other';
  location?: string;
  height?: number;
  weight?: number;
  occupation?: string;
  school?: string;
  bloodType?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      return {
        user: null,
        token: null,
        login: async (identifier: string, password?: string) => {
          const response = await api.post('/auth/login', { identifier, password });
          const { user, token } = response.data;
          set({ user, token });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
        },
        loginWithGoogle: async (idToken: string) => {
          const response = await api.post('/auth/google', { idToken });
          const { user, token } = response.data;
          set({ user, token });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
        },
        register: async (data: RegisterData) => {
          const response = await api.post('/auth/register', data);
          const { user, token } = response.data;
          set({ user, token });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
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
      onRehydrateStorage: () => {
        return (state) => {
          // After rehydration, try to restore user from token
          if (state && typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            if (storedToken && !state.token) {
              // Try to restore user from token
              api.get('/auth/me')
                .then(response => {
                  state.user = response.data.user;
                  state.token = storedToken;
                })
                .catch(() => {
                  // Token invalid, clear it
                  localStorage.removeItem('token');
                  state.user = null;
                  state.token = null;
                });
            }
          }
        };
      },
    }
  )
);

