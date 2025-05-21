import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/Config';

interface Test {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
}

export default function TestsScreen() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

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
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/tests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load tests');
      }

      const data = await response.json();
      setTests(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tests');
    }
  };

  const handleTestPress = (test: Test) => {
    router.push(`/test/${test.id}`);
  };

  const renderTestItem = ({ item }: { item: Test }) => (
    <TouchableOpacity
      style={styles.testItem}
      onPress={() => handleTestPress(item)}
    >
      <View style={styles.testHeader}>
        <Text style={styles.testTitle}>{item.title}</Text>
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>
      <Text style={styles.testDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tests}
        renderItem={renderTestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      {isAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/test/create')}
        >
          <Text style={styles.addButtonText}>Add New Test</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  testItem: {
    backgroundColor: 'white',
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
    fontWeight: 'bold',
  },
  testDescription: {
    color: '#666',
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
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 