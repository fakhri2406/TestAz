import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import { AuthError, ValidationError } from '../utils/errors';
import { translations } from '@/constants/translations';

class ApiService {
  private baseUrl: string;
  private axiosInstance: typeof axios;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: false // Disable credentials for CORS
    });
  }

  private async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private async get<T>(endpoint: string) {
    const headers = await this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.axiosInstance.get<T>(url, { headers });
    return response.data;
  }

  private async post<T>(endpoint: string, data: any) {
    const headers = await this.getHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.axiosInstance.post<T>(url, data, { headers });
    return response.data;
  }

  async login(email: string, password: string) {
    try {
      const response = await this.post('/api/auth/login', { email, password });
      
      if (!response.token || !response.user) {
        return { success: false, message: 'Login failed' };
      }

      return response;
    } catch (error) {
      // Silently handle errors and return appropriate warning messages
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        switch (status) {
          case 401:
            return { success: false, message: 'Invalid email or password' };
          case 400:
            return { success: false, message: 'Please check your email and password format' };
          default:
            return { success: false, message: 'Unable to connect to the server' };
        }
      }
      
      return { success: false, message: 'Unable to connect to the server' };
    }
  }

  async signup(userData: { email: string; password: string; name: string; surname: string }) {
    try {
      console.log('Attempting signup with data:', { ...userData, password: '[REDACTED]' });
      console.log('Base URL:', this.baseUrl);
      const endpoint = '/api/auth/signup';
      console.log('Endpoint:', endpoint);
      const url = `${this.baseUrl}${endpoint}`;
      console.log('Full URL:', url);
      
      const headers = await this.getHeaders();
      console.log('Request headers:', headers);
      
      const response = await this.axiosInstance.post(url, userData, { headers });
      console.log('Signup response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Signup error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });
      }
      throw error;
    }
  }

  async resendVerification(data: { email: string }) {
    try {
      console.log('Attempting to resend verification code for:', data.email);
      const endpoint = '/api/auth/resend-code';
      const url = `${this.baseUrl}${endpoint}`;
      console.log('Full URL:', url);
      
      const headers = await this.getHeaders();
      console.log('Request headers:', headers);
      console.log('Request data:', data);
      
      const response = await this.axiosInstance.post(url, { email: data.email }, { headers });
      console.log('Resend verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resend verification error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  async verifyCode(data: { email: string; code: string }) {
    try {
      console.log('Attempting to verify code for:', data.email);
      const endpoint = '/api/auth/verify-code';
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers = await this.getHeaders();
      const response = await axios.post(url, data, { headers });
      console.log('Verify code response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify code error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  }

  async createTest(testData: {
    title: string;
    description: string;
    isPremium: boolean;
    questions: Array<{
      text: string;
      options: Array<{
        text: string;
        isCorrect: boolean;
      }>;
    }>;
  }) {
    try {
      console.log('Creating test with data:', testData);
      const headers = await this.getHeaders();
      console.log('Request headers:', headers);
      
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in as an admin.');
      }

      // Check if user is admin
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        throw new Error('User data not found. Please log in again.');
      }
      const user = JSON.parse(userData);
      if (user.role !== 'Admin') {
        throw new Error('Admin privileges required to create tests.');
      }

      const response = await axios.post(`${this.baseUrl}/api/test/create`, testData, { 
        headers: {
          ...headers,
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Create test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating test:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  async getTests() {
    try {
      console.log('Fetching tests...');
      const response = await this.get('/api/test');
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
    try {
      console.log('Getting test:', id);
      const response = await this.get(`/api/test/${id}`);
      console.log('Test response:', response);
      return response;
    } catch (error) {
      console.error('Error getting test:', error);
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

  async getUserById(id: string) {
    try {
      console.log('Getting user by ID:', id);
      const formattedId = id.replace(/[{}]/g, '').toLowerCase();
      console.log('Formatted ID:', formattedId);
      
      const response = await this.get(`/api/auth/user/id/${formattedId}`);
      console.log('User data response:', response);
      return response;
    } catch (error) {
      console.error('Error in getUserById:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
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

  async submitTestSolution(solution: {
    testId: string;
    answers: {
      questionId: string;
      selectedOptionIndex: number;
    }[];
  }) {
    try {
      console.log('Submitting test solution:', solution);
      const headers = await this.getHeaders();
      console.log('Request headers:', headers);
      
      const userData = await AsyncStorage.getItem('user');
      console.log('User data from storage:', userData);
      
      if (!userData) {
        throw new Error('User not authenticated');
      }
      const { id: userId } = JSON.parse(userData);
      console.log('User ID:', userId);

      const solutionWithUserId = {
        ...solution,
        userId
      };
      console.log('Solution with user ID:', solutionWithUserId);

      const response = await this.post('/api/usersolution/submit', solutionWithUserId);
      console.log('Submit solution response:', response);
      return response;
    } catch (error) {
      console.error('Error submitting test solution:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  async getTestResults(userId: string) {
    try {
      console.log('Getting test results for user:', userId);
      const response = await this.get(`/api/usersolution/user/${userId}`);
      console.log('Test results response:', response);
      return response;
    } catch (error) {
      console.error('Error getting test results:', error);
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

  async getTestResultDetail(id: string) {
    try {
      console.log('Getting test result detail:', id);
      const formattedId = id.replace(/[^0-9a-fA-F-]/g, '');
      const guidFormat = formattedId.length === 32 
        ? `${formattedId.slice(0, 8)}-${formattedId.slice(8, 12)}-${formattedId.slice(12, 16)}-${formattedId.slice(16, 20)}-${formattedId.slice(20)}`
        : formattedId;
      console.log('Formatted GUID:', guidFormat);
      
      const response = await this.get(`/api/usersolution/${guidFormat}`);
      console.log('Raw test result detail response:', response);

      // Format the result data using the answer data directly from the response
      const formattedResult = {
        ...response,
        answers: response.answers?.map(answer => ({
          questionId: answer.questionId,
          questionText: answer.questionText,
          selectedOptionIndex: answer.selectedOptionIndex,
          correctOptionIndex: answer.options.findIndex(o => o === answer.correctOption),
          options: answer.options,
          correctOption: answer.correctOption,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned || 0,
          totalPoints: answer.totalPoints || 1
        })) || []
      };

      console.log('Formatted test result:', formattedResult);
      return formattedResult;
    } catch (error) {
      console.error('Error getting test result detail:', error);
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

  async upgradeToPremium() {
    try {
      const headers = await this.getHeaders();
      const url = `${this.baseUrl}/api/user/premium`;
      const response = await axios.post(url, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Error upgrading to premium:', error);
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