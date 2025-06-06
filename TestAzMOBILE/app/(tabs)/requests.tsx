import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

interface Request {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  createdAt: string;
}

export default function RequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.getPremiumRequests();
      setRequests(response);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch premium requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'Admin') {
      router.replace('/');
      return;
    }
    fetchRequests();
  }, [user]);

  const handleRequest = async (requestId: string, approve: boolean) => {
    try {
      await api.handlePremiumRequest(requestId, approve);
      await fetchRequests();
      Alert.alert('Success', `Request ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error handling request:', error);
      Alert.alert('Error', 'Failed to handle request');
    }
  };

  const renderRequestItem = ({ item }: { item: Request }) => (
    <ThemedView style={[styles.requestCard, { backgroundColor: cardBackgroundColor }]}>
      <ThemedView style={styles.requestInfo}>
        <ThemedView style={styles.userInfo}>
          <ThemedText style={styles.userName}>{item.userName}</ThemedText>
          <ThemedText style={styles.userEmail}>{item.userEmail}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.requestStatus}>
          <ThemedView style={[styles.statusBadge, { backgroundColor: item.status === 'Pending' ? '#FFA000' : item.status === 'Approved' ? '#4CAF50' : '#F44336' }]}>
            <ThemedText style={styles.statusText}>{item.status}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      {item.status === 'Pending' && (
        <ThemedView style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleRequest(item.id, true)}
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Approve</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRequest(item.id, false)}
          >
            <Ionicons name="close" size={20} color="white" />
            <ThemedText style={styles.actionButtonText}>Reject</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.header, { borderBottomColor: useThemeColor({}, 'border') }]}>
          <ThemedText style={styles.title}>Premium Requests</ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchRequests}>
            <Ionicons name="refresh" size={24} color={tintColor} />
          </TouchableOpacity>
        </ThemedView>

        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchRequests}
        />
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
  requestCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
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
  requestStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 