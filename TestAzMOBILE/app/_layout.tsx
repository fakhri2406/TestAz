import { Tabs, Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

export default function Layout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (!user) {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
