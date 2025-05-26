import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

interface UserData {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser?.id) {
        const userData = await api.getUserById(currentUser.id);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert(translations.error, translations.errorLoadingUserData);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      translations.logout,
      translations.logoutConfirmation,
      [
        {
          text: translations.cancel,
          style: 'cancel',
        },
        {
          text: translations.logout,
          style: 'destructive',
          onPress: async () => {
            try {
              await api.logout();
              router.replace('/login');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <ThemedView style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={tintColor} />
        </ThemedView>
        <ThemedText type="title" style={styles.name}>
          {user ? `${user.name} ${user.surname}` : translations.user}
        </ThemedText>
        <ThemedText type="subtitle" style={styles.email}>
          {user?.email}
        </ThemedText>
        {user?.role && (
          <ThemedText type="subtitle" style={styles.role}>
            {user.role}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: borderColor }]} 
          onPress={() => router.push('/settings/parameters')}
        >
          <Ionicons name="settings-outline" size={24} color={tintColor} />
          <ThemedText style={styles.menuText}>
            {translations.settings}
          </ThemedText>
          <Ionicons name="chevron-forward" size={24} color={borderColor} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: borderColor }]} 
          onPress={() => router.push('/settings/help')}
        >
          <Ionicons name="help-circle-outline" size={24} color={tintColor} />
          <ThemedText style={styles.menuText}>
            {translations.helpAndSupport}
          </ThemedText>
          <Ionicons name="chevron-forward" size={24} color={borderColor} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <ThemedText style={[styles.menuText, { color: '#FF3B30' }]}>
            {translations.logout}
          </ThemedText>
          <Ionicons name="chevron-forward" size={24} color={borderColor} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: 'capitalize',
  },
  section: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
}); 