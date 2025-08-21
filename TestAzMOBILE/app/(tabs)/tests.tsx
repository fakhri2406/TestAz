import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { ScreenshotPrevention } from '@/components/ScreenshotPrevention';

interface Test {
  id: string;
  title: string;
  description: string;
  score: number;
  isPremium: boolean;
}

export default function TestsScreen() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    loadTests();
    checkUserStatus();
  }, []);

  const loadTests = async () => {
    try {
      console.log('Starting to load tests...');
      setLoading(true);
      console.log('Making API call to get tests...');
      const testsData = await api.getTests();
      console.log('Received tests data:', JSON.stringify(testsData, null, 2));
      
      // Ensure we have properly formatted test objects
      const formattedTests = Array.isArray(testsData) 
        ? testsData.map(test => {
            console.log('Processing test:', test);
            return {
              id: test.id || '',
              title: test.title || '',
              description: test.description || '',
              score: typeof test.score === 'number' ? test.score : 0,
              isPremium: test.isPremium || false
            };
          })
        : [];
      console.log('Formatted tests:', JSON.stringify(formattedTests, null, 2));
      setTests(formattedTests);
    } catch (error) {
      console.error('Error loading tests:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      Alert.alert(
        translations.error,
        translations.failedToLoadTests
      );
    } finally {
      console.log('Finished loading tests');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTests();
  };

  const checkUserStatus = async () => {
    try {
      console.log('Checking user status...');
      const currentUser = await api.getCurrentUser();
      console.log('Current user:', currentUser);
      if (currentUser?.id) {
        const userData = await api.getUserById(currentUser.id);
        console.log('User data:', userData);
        setIsAdmin(userData.role === 'Admin');
        setIsPremium(userData.isPremium || false);
        console.log('User status set - isAdmin:', userData.role === 'Admin', 'isPremium:', userData.isPremium);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setIsAdmin(false);
      setIsPremium(false);
    }
  };

  const handleTestPress = (test: Test) => {
    if (isAdmin) {
      router.push({
        pathname: '/test/[id]',
        params: { id: test.id }
      });
    } else if (test.isPremium && !isPremium) {
      router.push('/premium');
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

  const renderTestItem = ({ item }: { item: Test }) => {
    // Skip rendering premium tests for non-premium, non-admin users
    if (!isAdmin && !isPremium && item.isPremium) {
      return (
        <TouchableOpacity
          style={[styles.testCard, { backgroundColor: cardBackgroundColor }]}
          onPress={() => router.push('/premium')}
        >
          <ThemedView style={styles.testHeader}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText style={styles.testTitle}>
                {item.title}
                <TouchableOpacity
                  style={styles.lockButton}
                  onPress={() => router.push('/premium')}
                >
                  <Ionicons 
                    name="lock-closed" 
                    size={20} 
                    color={tintColor} 
                  />
                </TouchableOpacity>
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText style={styles.testDescription}>{item.description}</ThemedText>
        </TouchableOpacity>
      );
    }

    // Render all other tests normally
    return (
      <TouchableOpacity
        style={[styles.testCard, { backgroundColor: cardBackgroundColor }]}
        onPress={() => handleTestPress(item)}
      >
        <ThemedView style={styles.testHeader}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.testTitle}>
              {item.title}
              {item.isPremium && (
                isAdmin || isPremium ? (
                  <ThemedText style={[styles.premiumStar, { color: tintColor }]}> ★</ThemedText>
                ) : null
              )}
            </ThemedText>
          </ThemedView>
          {isAdmin && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteTest(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#dc3545" />
            </TouchableOpacity>
          )}
        </ThemedView>
        <ThemedText style={styles.testDescription}>{item.description}</ThemedText>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{translations.loading}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScreenshotPrevention enabled={true} />
      {tests.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={tintColor} />
          <ThemedText style={styles.emptyText}>{translations.noTestsFound}</ThemedText>
          <ThemedView style={styles.actionButtonsContainer}>
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
              style={[styles.actionButton, { backgroundColor: cardBackgroundColor }]}
              onPress={onRefresh}
            >
              <Ionicons name="refresh" size={24} color={tintColor} />
              <ThemedText style={[styles.actionButtonText, { color: tintColor }]}> 
                {translations.refresh}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.headerContainer}>
            <ThemedView style={styles.filterContainer}>
              {isPremium && (
                <TouchableOpacity
                  style={[styles.filterButton, showPremiumOnly && { backgroundColor: tintColor }]}
                  onPress={() => setShowPremiumOnly(!showPremiumOnly)}
                >
                  <Ionicons 
                    name="star" 
                    size={20} 
                    color={showPremiumOnly ? backgroundColor : tintColor} 
                  />
                  <ThemedText 
                    style={[
                      styles.filterButtonText, 
                      { color: showPremiumOnly ? backgroundColor : tintColor }
                    ]}
                  >
                    {showPremiumOnly ? translations.showAllTests : translations.showPremiumTests}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
            <ThemedView style={styles.actionButtonsContainer}>
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: tintColor }]}
                  onPress={handleAddTest}
                >
                  <Ionicons name="add" size={24} color={backgroundColor} />
                  <ThemedText style={[styles.actionButtonText, { color: backgroundColor }]}> 
                    {translations.addNewTest}
                  </ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: cardBackgroundColor }]}
                onPress={onRefresh}
              >
                <Ionicons name="refresh" size={24} color={tintColor} />
                <ThemedText style={[styles.actionButtonText, { color: tintColor }]}> 
                  {translations.refresh}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <FlatList
            data={tests}
            keyExtractor={(item) => item.id}
            renderItem={renderTestItem}
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
  testCard: {
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
    position: 'absolute',
    bottom: 24,
    right: 24,
    padding: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  lockButton: {
    padding: 8,
    marginLeft: 8,
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  headerContainer: {
    padding: 15,
    gap: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumStar: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 