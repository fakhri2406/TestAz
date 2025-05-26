import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private async get<T>(endpoint: string) {
    const headers = await this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await axios.get<T>(url, { headers });
    return response.data;
  }

  private async post<T>(endpoint: string, data: any) {
    const headers = await this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await axios.post<T>(url, data, { headers });
    return response.data;
  }

  async login(email: string, password: string) {
    try {
      console.log('Attempting login with:', { email });
      const response = await this.post(API_CONFIG.ENDPOINTS.USER_LOGIN, { email, password });
      console.log('Login response:', response);
      
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        if (response.user) {
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  async signup(userData: { email: string; password: string; name: string; surname: string }) {
    return this.post(API_CONFIG.ENDPOINTS.USER_REGISTER, userData);
  }

  async createTest(testData: {
    title: string;
    description: string;
    questions: Array<{
      text: string;
      options: string[];
      correctOptionIndex: number;
    }>;
  }) {
    return this.post(API_CONFIG.ENDPOINTS.CREATE_TEST, testData);
  }

  async getTests() {
    try {
      console.log('Fetching tests...');
      const response = await this.get(API_CONFIG.ENDPOINTS.TESTS);
      console.log('Tests response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching tests:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  async getTest(id: string) {
    return this.get(API_CONFIG.ENDPOINTS.TEST_BY_ID(parseInt(id)));
  }

  async getUserById(id: string) {
    try {
      console.log('Getting user by ID:', id);
      const formattedId = id.replace(/[{}]/g, '').toLowerCase();
      console.log('Formatted ID:', formattedId);
      
      const url = API_CONFIG.ENDPOINTS.USER_BY_ID(formattedId);
      console.log('Request URL:', url);
      
      const response = await this.get(url);
      console.log('User data response:', response);
      
      // The backend returns the user data directly, not wrapped in a data property
      return response;
    } catch (error) {
      console.error('Error in getUserById:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  async deleteTest(id: string) {
    try {
      console.log('Deleting test:', id);
      const headers = await this.getHeaders();
      const url = `${this.baseUrl}/api/test/${id}`;
      const response = await axios.delete(url, { headers });
      return response.data;
    } catch (error) {
      console.error('Error deleting test:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }
}

export const apiService = new ApiService(); 