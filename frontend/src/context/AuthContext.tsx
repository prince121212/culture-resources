"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  UserCredentials,
  UserRegistrationData,
  AuthResponse,
  ApiError,
} from '@/services/auth.service';

// Define a User type for the AuthContext, simpler than AuthResponse['user']
interface AuthUser {
  _id: string;
  username: string;
  email: string;
  role?: string;
  avatar?: string;
  points?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add other fields as needed
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => Promise<AuthResponse>;
  register: (userData: UserRegistrationData) => Promise<AuthResponse>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
  updateUserContext?: (updatedUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true to check storage
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUserJson = localStorage.getItem('authUser');
      if (storedToken && storedUserJson) {
        setToken(storedToken);
        setUser(JSON.parse(storedUserJson) as AuthUser);
      }
    } catch (e) {
      console.error("Failed to parse auth data from localStorage", e);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (response: AuthResponse): AuthResponse => {
    if (response.token && response.user) {
      const authUser: AuthUser = {
        _id: response.user._id,
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        status: response.user.status,
        avatar: response.user.avatar,
        points: response.user.points,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt
      };
      setToken(response.token);
      setUser(authUser);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('authUser', JSON.stringify(authUser));
      setError(null);
      return response;
    } else {
      const errMsg = 'Authentication response missing token or user data.';
      setError(errMsg);
      throw new ApiError(500, errMsg, { message: errMsg });
    }
  };

  const login = async (credentials: UserCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiLogin(credentials);
      return handleAuthSuccess(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.response?.message || err.message);
        throw err;
      } else if (err instanceof Error) {
        setError(err.message);
        throw new ApiError(500, err.message, { message: err.message });
      } else {
        const unknownMsg = 'An unknown error occurred during login.';
        setError(unknownMsg);
        throw new ApiError(500, unknownMsg, { message: unknownMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserRegistrationData): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRegister(userData);
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.response?.message || err.message);
        throw err;
      } else if (err instanceof Error) {
        setError(err.message);
        throw new ApiError(500, err.message, { message: err.message });
      } else {
        const unknownMsg = 'An unknown error occurred during registration.';
        setError(unknownMsg);
        throw new ApiError(500, unknownMsg, { message: unknownMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const updateUserContext = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user && !isLoading,
      login,
      register,
      logout,
      error,
      clearError,
      updateUserContext
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};