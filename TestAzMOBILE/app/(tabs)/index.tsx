import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user } = useAuth();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleAdminAction = (action: 'users' | 'requests') => {
    if (action === 'users') {
      router.push('/(admin)/users');
    } else if (action === 'requests') {
      router.push('/(admin)/requests');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {translations.welcomeToTestAz}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        {translations.learningJourneyStarts}
      </ThemedText>

      {/* Admin buttons - only show for Admin users */}
      {user?.role === 'Admin' && (
        <ThemedView style={styles.adminSection}>
          <ThemedText style={styles.adminSectionTitle}>Admin Panel</ThemedText>
          <ThemedView style={styles.adminButtons}>
            <TouchableOpacity
              style={[styles.adminButton, { backgroundColor: backgroundColor }]}
              onPress={() => handleAdminAction('users')}
            >
              <Ionicons name="people" size={24} color={tintColor} />
              <ThemedText style={styles.adminButtonText}>Users</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.adminButton, { backgroundColor: backgroundColor }]}
              onPress={() => handleAdminAction('requests')}
            >
              <Ionicons name="star" size={24} color={tintColor} />
              <ThemedText style={styles.adminButtonText}>Premium Requests</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  adminSection: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  adminSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  adminButtons: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
  },
  adminButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  adminButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 