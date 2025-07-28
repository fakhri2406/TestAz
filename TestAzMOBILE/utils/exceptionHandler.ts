import { Alert } from 'react-native';
import { translations } from '@/constants/translations';

export interface ErrorInfo {
  message: string;
  type: 'error' | 'warning' | 'info';
  actions?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export class ExceptionHandler {
  private static isHandling = false;

  static handle(error: any, context?: string, navigationCallback?: () => void): void {
    // Prevent recursive error handling
    if (this.isHandling) {
      return;
    }

    this.isHandling = true;

    // Suppress all console logging for errors
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;
    console.error = () => {};
    console.log = () => {};

    try {
      // Extract error message
      let errorMessage = 'An unexpected error occurred';
      let errorType: 'error' | 'warning' | 'info' = 'error';
      let actions: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [
        { text: 'OK', style: 'default' }
      ];

      // Handle different types of errors
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data) {
        errorMessage = error.data;
      }

      // Map specific error messages to user-friendly messages
      const errorInfo = this.mapErrorToUserMessage(errorMessage, context, navigationCallback);
      errorMessage = errorInfo.message;
      errorType = errorInfo.type;
      if (errorInfo.actions) {
        actions = errorInfo.actions;
      }

      // Show all notifications as warnings instead of errors
      Alert.alert(translations.warning, errorMessage, actions);

    } catch (handlingError) {
      // Fallback to simple error alert if our handler fails
      Alert.alert('Error', 'An error occurred while handling another error');
    } finally {
      // Restore console functions
      console.error = originalConsoleError;
      console.log = originalConsoleLog;
      this.isHandling = false;
    }
  }

  private static mapErrorToUserMessage(errorMessage: string, context?: string, navigationCallback?: () => void): ErrorInfo {
    // Authentication errors
    if (errorMessage.includes('User already exists')) {
      return {
        message: translations.userAlreadyExists,
        type: 'warning',
        actions: [
          { text: 'OK', style: 'default' },
          { 
            text: translations.goToLogin, 
            onPress: navigationCallback,
            style: 'default'
          }
        ]
      };
    }

    if (errorMessage.includes('Invalid credentials')) {
      return {
        message: translations.invalidCredentials || 'Invalid email or password',
        type: 'warning'
      };
    }

    if (errorMessage.includes('Please verify your email')) {
      return {
        message: translations.emailNotVerified,
        type: 'warning'
      };
    }

    // Network errors
    if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
      return {
        message: translations.networkError || 'Please check your internet connection and try again',
        type: 'warning'
      };
    }

    if (errorMessage.includes('Request failed with status code 500')) {
      return {
        message: translations.serverError || 'Server error. Please try again later',
        type: 'warning'
      };
    }

    if (errorMessage.includes('Request failed with status code 404')) {
      return {
        message: translations.notFound || 'Resource not found',
        type: 'warning'
      };
    }

    // API specific errors
    if (errorMessage.includes('Authentication required')) {
      return {
        message: translations.authenticationRequired || 'Please log in to continue',
        type: 'warning'
      };
    }

    if (errorMessage.includes('Admin privileges required')) {
      return {
        message: translations.adminRequired || 'Admin privileges required for this action',
        type: 'warning'
      };
    }

    // Test related errors
    if (errorMessage.includes('Test not found')) {
      return {
        message: translations.testNotFound,
        type: 'warning'
      };
    }

    if (errorMessage.includes('Failed to create test')) {
      return {
        message: translations.failedToCreateTest,
        type: 'warning'
      };
    }

    if (errorMessage.includes('Failed to load test')) {
      return {
        message: translations.failedToLoadTest,
        type: 'warning'
      };
    }

    // Premium related errors
    if (errorMessage.includes('already premium')) {
      return {
        message: translations.alreadyPremium,
        type: 'warning'
      };
    }

    if (errorMessage.includes('Premium request submitted')) {
      return {
        message: translations.premiumRequestSubmitted,
        type: 'warning'
      };
    }

    // Default error
    return {
      message: translations.generalError || 'Something went wrong. Please try again.',
      type: 'warning'
    };
  }

  // Silent error handling for non-critical errors
  static handleSilently(error: any, context?: string): void {
    // Only log to console, don't show user notification
    console.log(`Silent error in ${context}:`, error);
  }

  // Handle errors with custom actions
  static handleWithActions(error: any, actions: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>, context?: string): void {
    const errorInfo = this.mapErrorToUserMessage(typeof error === 'string' ? error : error?.message || 'Unknown error', context);
    Alert.alert(translations.error, errorInfo.message, actions);
  }
} 