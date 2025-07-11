import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, Modal, View, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  isPremium: boolean;
  role: string;
}

export default function UsersScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'Admin') {
      router.replace('/');
      return;
    }
    fetchUsers();
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      await fetchUsers();
      Alert.alert('Success', 'User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handlePremiumToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateUserPremiumStatus(userId, !currentStatus);
      await fetchUsers();
      Alert.alert('Success', `User premium status ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating premium status:', error);
      Alert.alert('Error', 'Failed to update premium status');
    }
  };

  const showUserActions = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity onPress={() => showUserActions(item)}>
      <ThemedView style={[styles.userCard, { backgroundColor: cardBackgroundColor }]}>
        <ThemedView style={styles.userInfo}>
          <ThemedView style={styles.userMainInfo}>
            <ThemedText style={styles.userName}>{item.name} {item.surname}</ThemedText>
            <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.userStatus}>
            <ThemedView style={[styles.roleBadge, { backgroundColor: item.role === 'Admin' ? '#FFA000' : '#2196F3' }]}>
              <ThemedText style={styles.roleText}>{item.role}</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.premiumBadge, { backgroundColor: item.isPremium ? tintColor : '#ccc' }]}>
              <ThemedText style={styles.premiumText}>
                {item.isPremium ? 'Premium' : 'Free'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  const renderUserActionsModal = () => {
    // Check if the selected user is the current admin
    const isCurrentUser = selectedUser?.id === user?.id;
    
    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView 
            style={[styles.modalContent, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {selectedUser && (
              <>
                <ThemedView style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>User Actions</ThemedText>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={tintColor} />
                  </TouchableOpacity>
                </ThemedView>

                <ThemedView style={styles.modalBody}>
                  <ThemedView>
                    <ThemedText style={styles.modalUserName}>
                      {selectedUser.name} {selectedUser.surname}
                    </ThemedText>
                    <ThemedText style={styles.modalUserEmail}>
                      {selectedUser.email}
                    </ThemedText>
                  </ThemedView>

                  {isCurrentUser ? (
                    <ThemedView style={styles.actionSection}>
                      <ThemedText style={styles.actionSectionTitle}>Current User</ThemedText>
                      <ThemedText style={styles.disabledText}>
                        You cannot modify your own role or premium status.
                      </ThemedText>
                    </ThemedView>
                  ) : (
                    <>
                      <ThemedView style={styles.actionSection}>
                        <ThemedText style={styles.actionSectionTitle}>Change Role</ThemedText>
                        <ThemedView style={styles.roleButtons}>
                          <TouchableOpacity
                            style={[
                              styles.roleButton,
                              { backgroundColor: selectedUser.role === 'User' ? tintColor : '#ccc' }
                            ]}
                            onPress={() => handleRoleChange(selectedUser.id, 'User')}
                          >
                            <ThemedText style={styles.roleButtonText}>User</ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.roleButton,
                              { backgroundColor: selectedUser.role === 'Admin' ? tintColor : '#ccc' }
                            ]}
                            onPress={() => handleRoleChange(selectedUser.id, 'Admin')}
                          >
                            <ThemedText style={styles.roleButtonText}>Admin</ThemedText>
                          </TouchableOpacity>
                        </ThemedView>
                      </ThemedView>

                      <ThemedView style={styles.actionSection}>
                        <ThemedText style={styles.actionSectionTitle}>Premium Status</ThemedText>
                        <TouchableOpacity
                          style={[
                            styles.premiumButton,
                            { backgroundColor: selectedUser.isPremium ? '#ff4444' : tintColor }
                          ]}
                          onPress={() => handlePremiumToggle(selectedUser.id, selectedUser.isPremium)}
                        >
                          <ThemedText style={styles.premiumButtonText}>
                            {selectedUser.isPremium ? 'Remove Premium' : 'Make Premium'}
                          </ThemedText>
                        </TouchableOpacity>
                      </ThemedView>
                    </>
                  )}
                </ThemedView>
              </>
            )}
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Button title="Back to Main Menu" onPress={() => router.push('/')} />
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.header, { borderBottomColor: useThemeColor({}, 'border') }]}>
          <ThemedText style={styles.title}>Users</ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchUsers}>
            <Ionicons name="refresh" size={24} color={tintColor} />
          </TouchableOpacity>
        </ThemedView>

        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchUsers}
        />

        {renderUserActionsModal()}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userMainInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    gap: 20,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalUserEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  actionSection: {
    gap: 8,
  },
  actionSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  premiumButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
}); 