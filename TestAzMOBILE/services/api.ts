import { API_CONFIG } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';

// API Response type
interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

// API Error type
class ApiError extends Error {
    status: number;
    responseData?: any;
    
    constructor(message: string, status: number, responseData?: any) {
        super(message);
        this.status = status;
        this.responseData = responseData;
        this.name = 'ApiError';
    }
}

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  surname: string;
}

interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    surname: string;
    role: string;
  };
}

interface UserData {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  score?: number;
}

export const api = {
  login: async (credentials: LoginRequest) => {
    try {
      const response = await apiService.login(credentials.email, credentials.password);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (userData: SignupRequest) => {
    try {
      const response = await apiService.signup(userData);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<UserData | null> => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserById: async (id: string): Promise<UserData> => {
    try {
      const userData = await apiService.getUserById(id);
      if (!userData) {
        throw new Error('User not found');
      }
      return userData;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  },

  getTests: async (): Promise<Test[]> => {
    try {
      const response = await apiService.getTests();
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Get tests error:', error);
      throw error;
    }
  },

  getTest: async (id: string) => {
    try {
      const response = await apiService.getTest(id);
      return response;
    } catch (error) {
      console.error('Get test error:', error);
      throw error;
    }
  },

  createTest: async (testData: {
    title: string;
    description: string;
    questions: {
      text: string;
      options: string[];
      correctOptionIndex: number;
    }[];
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await apiService.createTest(testData);
      return response;
    } catch (error) {
      console.error('Create test error:', error);
      throw error;
    }
  },

  deleteTest: async (id: string): Promise<void> => {
    try {
      await apiService.deleteTest(id);
    } catch (error) {
      console.error('Delete test error:', error);
      throw error;
    }
  }
}; 