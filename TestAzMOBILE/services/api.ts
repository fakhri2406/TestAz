import { API_CONFIG } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "./apiService";
import axios from "axios";

// API Response type
interface ApiResponse<T> {
  id: any;
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
    this.name = "ApiError";
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

interface VerifyCodeRequest {
  email: string;
  code: string;
}

interface OpenQuestion {
  id: string;
  testId: string;
  text: string;
  correctAnswer: string;
  points: number;
  createdAt: string;
  updatedAt: string;
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
  isPremium: boolean;
}

interface Test {
  id: string;
  title: string;
  description: string;
  score?: number;
}

interface TestSolution {
  testId: string;
  score: number;
  scoreString: string;
  totalQuestions: number;
  correctAnswers: number;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect?: boolean;
    answerText?: string | null;
  }[];
  questions: {
    questionId: string;
    correctOptionIndex: number;
  }[];
}

interface TestSolutionResponse {
  id: string;
  message: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

interface VideoCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPremium: boolean;
  videoUrl: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  isPremium: boolean;
}

interface UpgradeRequest {
  id: string;
  userId: string;
  userEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface PremiumRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const api = {
  login: async (credentials: LoginRequest) => {
    try {
      const response = await apiService.login(
        credentials.email,
        credentials.password
      );
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  signup: async (userData: SignupRequest) => {
    try {
      const response = await apiService.signup(userData);
      return response;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  },

  getCurrentUser: async (): Promise<UserData | null> => {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getUserById: async (id: string): Promise<UserData> => {
    try {
      const userData = await apiService.getUserById(id);
      if (!userData) {
        throw new Error("User not found");
      }
      return userData;
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw error;
    }
  },

  getTests: async (): Promise<Test[]> => {
    try {
      const response = await apiService.getTests();
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Get tests error:", error);
      throw error;
    }
  },

  getTest: async (id: string): Promise<any> => {
    try {
      const response = await apiService.getTest(id);
      return response;
    } catch (error) {
      console.error("Get test error:", error);
      throw error;
    }
  },

  createTest: async (testData: {
    title: string;
    description: string;
    isPremium: boolean;
    questions: {
      text: string;
      options: Array<{
        text: string;
        isCorrect: boolean;
      }>;
    }[];
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await apiService.createTest(testData);
      return response;
    } catch (error) {
      console.error("Create test error:", error);
      throw error;
    }
  },

  deleteTest: async (id: string): Promise<void> => {
    try {
      await apiService.deleteTest(id);
    } catch (error) {
      console.error("Delete test error:", error);
      throw error;
    }
  },

  updateTest: async (
    id: string,
    data: {
      id: string;
      title: string;
      description: string;
      isPremium: boolean;
      createdAt: string | Date;
      isActive: boolean;
    }
  ): Promise<void> => {
    try {
      await apiService.updateTest(id, data);
    } catch (error) {
      console.error("Update test error:", error);
      throw error;
    }
  },

  submitTestSolution: async (
    solution: TestSolution
  ): Promise<TestSolutionResponse> => {
    try {
      const response = await apiService.submitTestSolution(solution);
      return response;
    } catch (error) {
      console.error("Submit test solution error:", error);
      throw error;
    }
  },

  getTestResults: async (userId: string): Promise<TestResult[]> => {
    try {
      const results = await apiService.getTestResults(userId);
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error("Get test results error:", error);
      throw error;
    }
  },

  getTestResultDetail: async (id: string) => {
    try {
      const response = await apiService.getTestResultDetail(id);
      return response;
    } catch (error) {
      console.error("Get test result detail error:", error);
      throw error;
    }
  },

  getOpenQuestions: async (testId: string): Promise<OpenQuestion[]> => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/test/${testId}/open-questions`);
      return response.data;
    } catch (error) {
      console.error('Error getting open questions:', error);
      throw error;
    }
  },

  // Video Course functions
  getVideoCourses: async (): Promise<VideoCourse[]> => {
    try {
      const response = await apiService.getVideoCourses();
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Get video courses error:", error);
      throw error;
    }
  },

  getVideoCourse: async (id: string): Promise<VideoCourse> => {
    try {
      const response = await apiService.getVideoCourse(id);
      return response;
    } catch (error) {
      console.error("Get video course error:", error);
      throw error;
    }
  },

  createVideoCourse: async (videoData: {
    title: string;
    description: string;
    duration: string;
    isPremium: boolean;
    videoUrl: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await apiService.createVideoCourse(videoData);
      return response;
    } catch (error) {
      console.error("Create video course error:", error);
      throw error;
    }
  },

  deleteVideoCourse: async (id: string): Promise<void> => {
    try {
      await apiService.deleteVideoCourse(id);
    } catch (error) {
      console.error("Delete video course error:", error);
      throw error;
    }
  },

  // User management functions
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiService.getAllUsers();
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  },

  updateUserPremiumStatus: async (
    userId: string,
    isPremium: boolean
  ): Promise<void> => {
    try {
      await apiService.updateUserPremiumStatus(userId, isPremium);
    } catch (error) {
      console.error("Update user premium status error:", error);
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    try {
      await apiService.updateUserRole(userId, role);
    } catch (error) {
      console.error("Update user role error:", error);
      throw error;
    }
  },

  resendVerification: async (data: { email: string }) => {
    try {
      const response = await apiService.resendVerification(data);
      return response;
    } catch (error) {
      console.error("Resend verification error:", error);
      throw error;
    }
  },

  addOpenQuestion: async (
    testId: string,
    data: {
      text: string;
      correctAnswer: string;
      points: number;
    }
  ) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/test/${testId}/open-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add open question");
      }

      return response.json();
    } catch (error) {
      console.error("Add open question error:", error);
      throw error;
    }
  },

  verifyCode: async (data: VerifyCodeRequest) => {
    try {
      const response = await apiService.verifyCode(data);
      return response;
    } catch (error) {
      console.error("Verify code error:", error);
      throw error;
    }
  },

  upgradeToPremium: async () => {
    try {
      const response = await apiService.upgradeToPremium();
      return response;
    } catch (error) {
      console.error("Upgrade to premium error:", error);
      throw error;
    }
  },

  requestPremiumUpgrade: async () => {
    try {
      const response = await apiService.requestPremiumUpgrade();
      return response;
    } catch (error) {
      console.error("Request premium upgrade error:", error);
      throw error;
    }
  },

  getUpgradeRequests: async (): Promise<UpgradeRequest[]> => {
    try {
      const response = await apiService.getUpgradeRequests();
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Get upgrade requests error:", error);
      throw error;
    }
  },

  approveUpgradeRequest: async (requestId: string): Promise<void> => {
    try {
      await apiService.approveUpgradeRequest(requestId);
    } catch (error) {
      console.error("Approve upgrade request error:", error);
      throw error;
    }
  },

  rejectUpgradeRequest: async (requestId: string): Promise<void> => {
    try {
      await apiService.rejectUpgradeRequest(requestId);
    } catch (error) {
      console.error("Reject upgrade request error:", error);
      throw error;
    }
  },

  getPremiumRequests: async (): Promise<PremiumRequest[]> => {
    try {
      const response = await apiService.getPremiumRequests();
      return response;
    } catch (error) {
      console.error("Get premium requests error:", error);
      throw error;
    }
  },

  handlePremiumRequest: async (
    requestId: string,
    approve: boolean
  ): Promise<void> => {
    try {
      if (approve) {
        await apiService.approvePremiumRequest(requestId);
      } else {
        await apiService.rejectPremiumRequest(requestId, "Rejected by admin");
      }
    } catch (error) {
      console.error("Handle premium request error:", error);
      throw error;
    }
  },
};
