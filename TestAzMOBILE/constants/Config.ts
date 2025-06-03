import { Platform } from 'react-native';

export const API_URL = Platform.select({
  android: 'http://10.0.2.2:5248/api',
  ios: 'http://localhost:5248/api',
  default: 'http://localhost:5248/api'
});

// Add other configuration constants here as needed
export const APP_NAME = 'TestAz'; 