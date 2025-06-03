import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  isPremium: boolean;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    checkAdminStatus();
    loadUsers();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser?.id) {
        const userData = await api.getUserById(currentUser.id);
        setIsAdmin(userData.role === 'Admin');
        if (userData.role !== 'Admin') {
          router.replace('/');
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      router.replace('/');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await api.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleTogglePremium = async (userId: string, currentPremiumStatus: boolean) => {
    try {
      await api.updateUserPremiumStatus(userId, !currentPremiumStatus);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isPremium: !currentPremiumStatus }
            : user
        )
      );
      Alert.alert('Success', `User premium status updated successfully`);
    } catch (error) {
      console.error('Error updating user premium status:', error);
      Alert.alert('Error', 'Failed to update user premium status');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
    try {
      await api.updateUserRole(userId, newRole);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );
      Alert.alert('Success', `User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={[styles.userCard, { backgroundColor: cardBackgroundColor }]}>
            <ThemedView style={styles.userInfo}>
              <ThemedText type="title" style={styles.userName}>
                {item.name} {item.surname}
              </ThemedText>
              <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
              <ThemedView style={styles.userBadges}>
                <ThemedView style={[
                  styles.badge,
                  { backgroundColor: item.role === 'Admin' ? tintColor : '#666' }
                ]}>
                  <ThemedText style={styles.badgeText}>{item.role}</ThemedText>
                </ThemedView>
                {item.isPremium && (
                  <ThemedView style={[styles.badge, { backgroundColor: '#FFD700' }]}>
                    <ThemedText style={styles.badgeText}>Premium</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: item.isPremium ? '#666' : tintColor }]}
                onPress={() => handleTogglePremium(item.id, item.isPremium)}
              >
                <Ionicons 
                  name={item.isPremium ? "star" : "star-outline"} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: item.role === 'Admin' ? '#666' : tintColor }]}
                onPress={() => handleToggleRole(item.id, item.role)}
              >
                <Ionicons 
                  name={item.role === 'Admin' ? "shield" : "shield-outline"} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[tintColor]}
            tintColor={tintColor}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 