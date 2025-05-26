import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

interface Test {
  id: string;
  title: string;
  description: string;
  score?: number;
}

export default function TestsScreen() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    loadTests();
    checkAdminStatus();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const testsData = await api.getTests();
      setTests(testsData);
    } catch (error) {
      console.error('Error loading tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTests();
  };

  const checkAdminStatus = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser?.id) {
        const userData = await api.getUserById(currentUser.id);
        setIsAdmin(userData.role === 'Admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleTestPress = (test: Test) => {
    if (isAdmin) {
      router.push({
        pathname: '/test/[id]',
        params: { id: test.id }
      });
    } else {
      router.push({
        pathname: '/test/take/[id]',
        params: { id: test.id }
      });
    }
  };

  const handleAddTest = () => {
    router.push('/test/new');
  };

  const handleDeleteTest = async (testId: string) => {
    Alert.alert(
      'Delete Test',
      'Are you sure you want to delete this test?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.deleteTest(testId);
              // Remove the deleted test from the local state
              setTests(prevTests => prevTests.filter(test => test.id !== testId));
              Alert.alert('Success', 'Test deleted successfully');
            } catch (error) {
              console.error('Error deleting test:', error);
              Alert.alert('Error', 'Failed to delete test. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
      {tests.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>Mövcud test tapılmadı</ThemedText>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={handleAddTest}
            >
              <Ionicons name="add" size={24} color={backgroundColor} />
              <ThemedText style={[styles.addButtonText, { color: backgroundColor }]}>
                {translations.addNewTest}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      ) : (
        <>
          <FlatList
            data={tests}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.testItem, { backgroundColor: cardBackgroundColor }]}
                onPress={() => handleTestPress(item)}
              >
                <ThemedView style={styles.testHeader}>
                  <ThemedText type="title" style={styles.testTitle}>{item.title}</ThemedText>
                  <ThemedView style={styles.headerRight}>
                    <ThemedText type="subtitle" style={styles.testScore}>
                      {translations.score}: {item.score || 0}
                    </ThemedText>
                    {isAdmin && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTest(item.id)}
                      >
                        <Ionicons name="trash-outline" size={24} color="#ff3b30" />
                      </TouchableOpacity>
                    )}
                  </ThemedView>
                </ThemedView>
                <ThemedText style={styles.testDescription}>{item.description}</ThemedText>
              </TouchableOpacity>
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
          <ThemedView style={styles.buttonContainer}>
            {isAdmin && (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: tintColor }]}
                onPress={handleAddTest}
              >
                <Ionicons name="add" size={24} color={backgroundColor} />
                <ThemedText style={[styles.addButtonText, { color: backgroundColor }]}>
                  {translations.addNewTest}
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.reloadButton, { backgroundColor: cardBackgroundColor }]}
              onPress={onRefresh}
            >
              <Ionicons name="refresh" size={24} color={tintColor} />
            </TouchableOpacity>
          </ThemedView>
        </>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    padding: 16,
  },
  testItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  testScore: {
    fontSize: 16,
  },
  testDescription: {
    fontSize: 14,
  },
  addButton: {
    padding: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reloadButton: {
    padding: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
}); 