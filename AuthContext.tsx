import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from './utils/api';

interface User {
  userID: number;
  fullName: string;
  userName: string;
  emailID: string;
  mobileNo: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    try {
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      // Continue with logout even if API fails
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const refreshTokens = useCallback(async () => {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) {
      clearAuth();
      return false;
    }

    try {
      const response = await authAPI.refreshToken(currentRefreshToken);
      const data = response.data;

      if (data.success && data.data && data.data[0]) {
        const newToken = data.data[0].token;
        const newRefreshToken = data.data[0].refreshToken;

        setToken(newToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch (error) {
      clearAuth();
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedRefreshToken = localStorage.getItem('refreshToken');
      const savedUser = localStorage.getItem('user');
      
if (savedToken && savedRefreshToken && savedUser) {
        setToken(savedToken);
        setRefreshToken(savedRefreshToken);
        setUser(JSON.parse(savedUser));
        // Don't refresh here - interceptor will handle refresh lazily when 401 occurs
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [refreshTokens]);

  const login = (userData: User, authToken: string, authRefreshToken: string) => {
    setUser(userData);
    setToken(authToken);
    setRefreshToken(authRefreshToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('refreshToken', authRefreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      refreshToken,
      isAuthenticated: !!token, 
      isLoading,
      login, 
      logout,
      refreshTokens
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};