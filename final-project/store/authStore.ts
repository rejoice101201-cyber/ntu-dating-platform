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
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  setAuth: (user: User, token: string) => void;
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
        login: async (email: string, password: string) => {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data;
          set({ user, token });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            // 記錄最近密碼登入時間，10 分鐘內可直接進站
            const expiresAt = Date.now() + 10 * 60 * 1000;
            localStorage.setItem('recentLoginExpiresAt', String(expiresAt));
          }
        },
        loginWithGoogle: async (idToken: string) => {
          const response = await api.post('/auth/google', { idToken });
          const { user, token } = response.data;
          set({ user, token });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            const expiresAt = Date.now() + 10 * 60 * 1000;
            localStorage.setItem('recentLoginExpiresAt', String(expiresAt));
          }
        },
        register: async (data: RegisterData) => {
          const response = await api.post('/auth/register', data);
          const { user, token } = response.data;
          set({ user, token });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            const expiresAt = Date.now() + 10 * 60 * 1000;
            localStorage.setItem('recentLoginExpiresAt', String(expiresAt));
          }
        },
        logout: () => {
          set({ user: null, token: null });
          localStorage.removeItem('token');
          localStorage.removeItem('recentLoginExpiresAt');
        },
        updateUser: (user: User) => {
          set({ user });
        },
        setAuth: (user: User, token: string) => {
          set({ user, token });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            const expiresAt = Date.now() + 10 * 60 * 1000;
            localStorage.setItem('recentLoginExpiresAt', String(expiresAt));
          }
        },
      };
    },
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store/authStore.ts:onRehydrateStorage',message:'Auth store rehydration started',data:{hasState:!!state,hasWindow:typeof window !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{})
          // #endregion
          // After rehydration, try to restore user from token
          if (state && typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store/authStore.ts:onRehydrateStorage',message:'Checking stored token',data:{hasStoredToken:!!storedToken,hasStateToken:!!state.token,userId:state?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{})
            // #endregion
            if (storedToken && !state.token) {
              // Try to restore user from token
              api.get('/auth/me')
                .then(response => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store/authStore.ts:onRehydrateStorage',message:'User restored from token',data:{userId:response.data.user?.id,hasUser:!!response.data.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{})
                  // #endregion
                  state.user = response.data.user;
                  state.token = storedToken;
                })
                .catch(() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/f87aa6be-13d8-46a5-9a9a-42ffe933ed05',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store/authStore.ts:onRehydrateStorage',message:'Token invalid, clearing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{})
                  // #endregion
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

