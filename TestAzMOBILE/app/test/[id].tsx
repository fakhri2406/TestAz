import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '@/constants/translations';

interface Test {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
      orderIndex: number;
    }>;
  }>;
}

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    checkAdminStatus();
    loadTest();
  }, [id]);

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

  const loadTest = async () => {
    try {
      setLoading(true);
      const testData = await api.getTest(id as string);
      console.log('Test data:', JSON.stringify(testData, null, 2));
      setTest(testData);
    } catch (error) {
      console.error('Error loading test:', error);
      Alert.alert(translations.error, translations.failedToLoadTests);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = () => {
    Alert.alert(
      translations.deleteTest,
      translations.deleteTestConfirmation,
      [
        {
          text: translations.cancel,
          style: 'cancel'
        },
        {
          text: translations.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.deleteTest(id as string);
              Alert.alert(translations.success, translations.testDeleted);
              router.push('/(tabs)/tests');
            } catch (error) {
              console.error('Error deleting test:', error);
              Alert.alert(translations.error, translations.failedToDeleteTest);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading || !test) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{translations.loading}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={[styles.returnButton, { backgroundColor: cardBackgroundColor }]}
          onPress={() => router.push('/(tabs)/tests')}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
          <ThemedText style={[styles.returnButtonText, { color: tintColor }]}>
            {translations.back}
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedView style={styles.headerContainer}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText style={styles.title}>{test.title}</ThemedText>
              {test.isPremium && (
                <ThemedView style={styles.premiumBadge}>
                  <Ionicons name="star" size={16} color={tintColor} />
                  <ThemedText style={[styles.premiumText, { color: tintColor }]}>
                    {translations.premium}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
            {isAdmin && (
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: '#dc3545' }]}
                onPress={handleDeleteTest}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <ThemedText style={styles.deleteButtonText}>
                  {translations.delete}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>

          <ThemedText style={styles.description}>{test.description}</ThemedText>

          <ThemedView style={styles.questionsContainer}>
            {test.questions.map((question, questionIndex) => (
              <ThemedView 
                key={question.id} 
                style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}
              >
                <ThemedText style={styles.questionNumber}>
                  {translations.question} {questionIndex + 1}
                </ThemedText>
                <ThemedText style={styles.questionText}>{question.text}</ThemedText>

                <ThemedView style={styles.optionsContainer}>
                  {question.options
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((option, optionIndex) => (
                      <ThemedView
                        key={option.id}
                        style={[
                          styles.optionContainer,
                          option.isCorrect && { borderColor: '#4CAF50' }
                        ]}
                      >
                        <ThemedText style={styles.optionText}>
                          {optionIndex + 1}. {option.text}
                        </ThemedText>
                        {option.isCorrect && (
                          <ThemedText style={[styles.correctBadge, { color: '#4CAF50' }]}>
                            ✓
                          </ThemedText>
                        )}
                      </ThemedView>
                    ))}
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  questionsContainer: {
    gap: 16,
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  correctBadge: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 