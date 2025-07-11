import { Tabs, Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      }
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      {user?.role === 'Admin' ? (
        <Stack.Screen name="(admin)" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
