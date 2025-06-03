import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../constants/Config';

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
}

interface DecodedToken {
  exp: number;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const decodeToken = (token: string): DecodedToken => {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token');
    }
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = decodeToken(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const extractUserFromToken = (token: string): User => {
    const decoded = decodeToken(token);
    return {
      id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
      name: '', // These will be populated from the login response
      surname: '', // These will be populated from the login response
    };
  };

  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser && !isTokenExpired(storedToken)) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token is expired or invalid, clear everything
        await logout();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with email:', email);
      console.log('API URL:', API_URL);
      
      const response = await api.login({ email, password });
      console.log('Login response:', JSON.stringify(response, null, 2));
      
      const { token: newToken, user: userData } = response;
      
      if (!newToken || !userData) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid login response');
      }

      // Verify token is valid
      const decodedUser = extractUserFromToken(newToken);
      console.log('Decoded user from token:', JSON.stringify(decodedUser, null, 2));
      console.log('User role from token:', decodedUser.role);
      console.log('User role from response:', userData.role);
      
      if (decodedUser.email !== email) {
        console.error('Token validation failed:', { decodedEmail: decodedUser.email, providedEmail: email });
        throw new Error('Token validation failed');
      }

      // Store token and user data
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      console.log('Login successful, user role:', userData.role);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 