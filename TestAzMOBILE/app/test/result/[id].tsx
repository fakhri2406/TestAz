import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

interface TestResultDetail {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    options: string[];
    isCorrect: boolean;
  }>;
}

export default function TestResultDetailScreen() {
  const { id } = useLocalSearchParams();
  const [result, setResult] = useState<TestResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    loadResult();
  }, [id]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const resultData = await api.getTestResultDetail(id as string);
      setResult(resultData);
    } catch (error) {
      console.error('Error loading test result:', error);
      Alert.alert('Error', 'Failed to load test result. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !result) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading result...</ThemedText>
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
            Return to Tests
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedText style={styles.title}>{result.testTitle}</ThemedText>
          <ThemedView style={[styles.scoreCard, { backgroundColor: cardBackgroundColor }]}>
            <ThemedText style={styles.scoreText}>
              Score: {result.score}/{result.totalQuestions}
            </ThemedText>
            <ThemedText style={styles.submittedText}>
              Submitted: {new Date(result.submittedAt).toLocaleDateString()}
            </ThemedText>
          </ThemedView>

          {result.answers.map((answer, index) => (
            <ThemedView key={answer.questionId} style={[styles.answerCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedText style={styles.questionNumber}>Question {index + 1}</ThemedText>
              <ThemedText style={styles.questionText}>{answer.questionText}</ThemedText>
              
              <ThemedView style={styles.optionsContainer}>
                {answer.options.map((option, optionIndex) => (
                  <ThemedView
                    key={optionIndex}
                    style={[
                      styles.optionContainer,
                      answer.selectedOptionIndex === optionIndex && { borderColor: answer.isCorrect ? '#4CAF50' : '#f44336' },
                      answer.correctOptionIndex === optionIndex && { borderColor: '#4CAF50' }
                    ]}
                  >
                    <ThemedText style={styles.optionText}>{String(option)}</ThemedText>
                    {answer.selectedOptionIndex === optionIndex && (
                      <ThemedText style={[styles.optionStatus, { color: answer.isCorrect ? '#4CAF50' : '#f44336' }]}>
                        {answer.isCorrect ? '✓' : '✗'}
                      </ThemedText>
                    )}
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          ))}
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
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  submittedText: {
    fontSize: 14,
    color: '#666',
  },
  answerCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  optionStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 