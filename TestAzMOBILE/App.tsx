import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { ExpoRoot } from 'expo-router';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: Failed prop type',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  return <ExpoRoot />;
} 