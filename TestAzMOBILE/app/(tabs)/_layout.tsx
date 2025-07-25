import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  const tabIconSelected = useThemeColor({}, 'tabIconSelected');

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
  }, [user]);

  // Show the same tabs for all users (admin buttons are now on the main page)
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tabIconSelected,
          tabBarInactiveTintColor: tabIconDefault,
          tabBarStyle: {
            backgroundColor: backgroundColor,
          },
          headerStyle: {
            backgroundColor: backgroundColor,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: useThemeColor({}, 'text'),
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
          headerLeftContainerStyle: {
            paddingLeft: Platform.OS === 'ios' ? 8 : 16,
          },
          headerRightContainerStyle: {
            paddingRight: Platform.OS === 'ios' ? 8 : 16,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: translations.home,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tests"
          options={{
            title: translations.tests,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="info"
          options={{
            title: translations.info,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="information-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: translations.profile,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
