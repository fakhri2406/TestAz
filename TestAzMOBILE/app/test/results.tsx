import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api } from '@/services/api';

interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

export default function TestResultsScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    checkAdminStatus();
    loadResults();
  }, []);

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

  const loadResults = async () => {
    try {
      setLoading(true);
      const currentUser = await api.getCurrentUser();
      if (!currentUser?.id) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const resultsData = await api.getTestResults(currentUser.id);
      // Ensure we're working with an array of TestResult objects
      const formattedResults = Array.isArray(resultsData) 
        ? resultsData.map(result => ({
            id: result.id || '',
            testId: result.testId || '',
            testTitle: result.testTitle || '',
            userId: result.userId || '',
            userName: result.userName || '',
            score: typeof result.score === 'number' ? result.score : 0,
            totalQuestions: typeof result.totalQuestions === 'number' ? result.totalQuestions : 0,
            submittedAt: result.submittedAt || new Date().toISOString()
          }))
        : [];
      setResults(formattedResults);
    } catch (error) {
      console.error('Error loading results:', error);
      Alert.alert('Error', 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: TestResult) => {
    router.push({
      pathname: '/test/result/[id]',
      params: { id: result.id }
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading results...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.resultCard, { backgroundColor: cardBackgroundColor }]}
            onPress={() => handleResultPress(item)}
          >
            <ThemedView style={styles.resultHeader}>
              <ThemedText style={styles.testTitle}>{item.testTitle}</ThemedText>
              <ThemedText style={styles.score}>
                Score: {item.score}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.resultDetails}>
              <ThemedText style={styles.detailText}>
                Submitted: {new Date(item.submittedAt).toLocaleDateString()}
              </ThemedText>
              {isAdmin && (
                <ThemedText style={styles.detailText}>
                  User: {item.userName}
                </ThemedText>
              )}
            </ThemedView>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
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
  resultCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  score: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
}); 