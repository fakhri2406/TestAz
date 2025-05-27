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
    try {
      console.log('Getting test:', id);
      const headers = await this.getHeaders();
      const url = `${this.baseUrl}/api/test/${id}`;
      const response = await axios.get(url, { headers });
      
      // Ensure the response data is properly formatted
      const testData = response.data;
      if (!testData) {
        throw new Error('No test data received');
      }

      // Format the test data
      return {
        id: testData.id || '',
        title: testData.title || '',
        description: testData.description || '',
        questions: Array.isArray(testData.questions) 
          ? testData.questions.map(q => ({
              id: q.id || '',
              text: q.text || '',
              options: Array.isArray(q.options) 
                ? q.options.map(o => typeof o === 'object' ? o.text : String(o))
                : [],
              correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0
            }))
          : []
      };
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
      
      const url = API_CONFIG.ENDPOINTS.USER_SOLUTIONS;
      console.log('Request URL:', url);
      
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

      const response = await this.post(url, solutionWithUserId, { headers });
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
      const headers = await this.getHeaders();
      const url = `${this.baseUrl}/api/usersolution/user/${userId}`;
      const response = await axios.get(url, { headers });
      return response.data;
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
      const headers = await this.getHeaders();
      // Ensure the ID is properly formatted as a GUID
      const formattedId = id.replace(/[^0-9a-fA-F-]/g, '');
      const url = `${this.baseUrl}/api/usersolution/${formattedId}`;
      const response = await axios.get(url, { headers });
      
      // Ensure the response data is properly formatted
      const resultData = response.data;
      if (!resultData) {
        throw new Error('No result data received');
      }

      // Format the result data
      return {
        id: resultData.id || '',
        testId: resultData.testId || '',
        testTitle: resultData.testTitle || '',
        userId: resultData.userId || '',
        userName: resultData.userName || '',
        score: typeof resultData.score === 'number' ? resultData.score : 0,
        totalQuestions: typeof resultData.totalQuestions === 'number' ? resultData.totalQuestions : 0,
        submittedAt: resultData.submittedAt || new Date().toISOString(),
        answers: Array.isArray(resultData.answers) 
          ? resultData.answers.map(a => ({
              questionId: a.questionId || '',
              questionText: a.questionText || '',
              selectedOptionIndex: typeof a.selectedOptionIndex === 'number' ? a.selectedOptionIndex : -1,
              correctOptionIndex: typeof a.correctOptionIndex === 'number' ? a.correctOptionIndex : -1,
              options: Array.isArray(a.options) ? a.options.map(o => String(o)) : [],
              isCorrect: Boolean(a.isCorrect)
            }))
          : []
      };
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
}

export const apiService = new ApiService(); 