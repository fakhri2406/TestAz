import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockTests } from '../../constants/mockData';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Test {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
}

export default function TestsScreen() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadTests();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.isAdmin);
    }
  };

  const loadTests = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTests(mockTests);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tests');
    }
  };

  const handleTestPress = (test: Test) => {
    router.push(`/test/${test.id}`);
  };

  const renderTestItem = ({ item }: { item: Test }) => (
    <TouchableOpacity
      style={[styles.testItem, { backgroundColor: cardBackgroundColor }]}
      onPress={() => handleTestPress(item)}
    >
      <ThemedView style={styles.testHeader}>
        <ThemedText type="defaultSemiBold" style={styles.testTitle}>{item.title}</ThemedText>
        {item.isPremium && (
          <ThemedView style={styles.premiumBadge}>
            <ThemedText style={styles.premiumText}>Premium</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      <ThemedText type="default" style={styles.testDescription}>{item.description}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={tests}
        renderItem={renderTestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      {isAdmin && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: tintColor }]}
          onPress={() => router.push('/test/create')}
        >
          <ThemedText style={[styles.addButtonText, { color: backgroundColor }]}>Add New Test</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  testItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 18,
  },
  testDescription: {
    opacity: 0.8,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
}); 