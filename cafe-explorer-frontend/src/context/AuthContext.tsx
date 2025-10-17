import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types/Cafe';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    token: null,
  });

  // Check for existing auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setAuthState({
        user: JSON.parse(savedUser),
        isLoggedIn: true,
        token: savedToken,
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fake authentication - accept any email/password
    if (email && password) {
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      };
      
      const token = 'fake-jwt-token-' + Date.now();
      
      setAuthState({
        user,
        isLoggedIn: true,
        token,
      });
      
      // Save to localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isLoggedIn: false,
      token: null,
    });
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
