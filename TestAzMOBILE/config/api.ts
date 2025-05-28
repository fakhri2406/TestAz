import { Platform } from 'react-native';

// Helper function to get the correct API URL based on the platform
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        // For Android emulator, use 10.0.2.2 to access host machine's localhost
        return 'http://10.0.2.2:5248';
    } else if (Platform.OS === 'ios') {
        // For iOS simulator, use localhost
        return 'http://localhost:5248';
    } else {
        // For physical devices, use your computer's IP address
        // You might need to change this to your actual IP address
        return 'http://10.0.2.2:5248';
    }
};

// Log the base URL for debugging
console.log('API Base URL:', getBaseUrl());

export const API_CONFIG = {
    BASE_URL: getBaseUrl(),
    
    ENDPOINTS: {
        // User endpoints
        USERS: '/api/user',
        USER_LOGIN: '/api/auth/login',
        USER_REGISTER: '/api/auth/signup',
        USER_BY_EMAIL: (email: string) => `/api/auth/user/${encodeURIComponent(email)}`,
        USER_BY_ID: (id: string) => `/api/auth/user/id/${encodeURIComponent(id)}`,
        
        // Test endpoints
        TESTS: '/api/test',
        TEST_BY_ID: (id: string) => `/api/test/${id}`,
        CREATE_TEST: '/api/test/create',
        
        // Video Course endpoints
        VIDEO_COURSES: '/api/videocourse',
        VIDEO_COURSE_BY_ID: (id: string) => `/api/videocourse/${id}`,
        
        // User Solutions endpoints
        USER_SOLUTIONS: '/api/usersolution',
        USER_SOLUTION_BY_ID: (id: string) => `/api/usersolution/${id}`,
    }
}; 