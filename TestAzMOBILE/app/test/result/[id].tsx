import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { ScreenshotPrevention } from '@/components/ScreenshotPrevention';

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
    correctOption: string;
  }>;
}

export default function TestResultDetailScreen() {
  const { id } = useLocalSearchParams();
  const [result, setResult] = useState<TestResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadResult();
  }, [id]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const resultData = await api.getTestResultDetail(id as string);
      console.log('Result data:', JSON.stringify(resultData, null, 2));
      console.log('Answers:', resultData.answers.map(a => ({
        questionText: a.questionText,
        selectedIndex: a.selectedOptionIndex,
        correctIndex: a.correctOptionIndex,
        options: a.options,
        isCorrect: a.isCorrect,
        correctOption: a.correctOption
      })));
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
      <ScreenshotPrevention />
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
              Score: {result.score.toFixed(1)}%
            </ThemedText>
            <ThemedText style={styles.submittedText}>
              Submitted: {new Date(result.submittedAt).toLocaleDateString()}
            </ThemedText>
          </ThemedView>

          {result.answers.map((answer, index) => (
            <ThemedView key={answer.questionId} style={[styles.answerCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedView style={styles.questionHeader}>
                <ThemedText style={styles.questionNumber}>Question {index + 1}</ThemedText>
                <ThemedText style={[
                  styles.correctnessStatus,
                  { color: answer.isCorrect ? '#4CAF50' : '#f44336' }
                ]}>
                  {answer.isCorrect ? 'Correct' : 'Incorrect'}
                </ThemedText>
              </ThemedView>
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
                    <ThemedText style={styles.optionText}>
                      {optionIndex + 1}. {String(option)}
                    </ThemedText>
                    {answer.selectedOptionIndex === optionIndex && (
                      <ThemedText style={[styles.optionStatus, { color: answer.isCorrect ? '#4CAF50' : '#f44336' }]}>
                        {answer.isCorrect ? '✓' : '✗'}
                      </ThemedText>
                    )}
                  </ThemedView>
                ))}
              </ThemedView>
              {!answer.isCorrect && (
                <ThemedView style={styles.correctAnswerContainer}>
                  <ThemedText style={styles.correctAnswerLabel}>Your Answer:</ThemedText>
                  <ThemedText style={[styles.correctAnswerText, { color: '#f44336' }]}>
                    {answer.selectedOptionIndex >= 0 && answer.options[answer.selectedOptionIndex] 
                      ? `${answer.selectedOptionIndex + 1}. ${answer.options[answer.selectedOptionIndex]}`
                      : 'No answer selected'}
                  </ThemedText>
                  <ThemedText style={[styles.correctAnswerLabel, { marginTop: 8 }]}>Correct Answer:</ThemedText>
                  <ThemedText style={[styles.correctAnswerText, { color: '#4CAF50' }]}>
                    {answer.correctOption
                      ? `${answer.correctOptionIndex + 1}. ${answer.correctOption}`
                      : 'No correct answer found'}
                  </ThemedText>
                </ThemedView>
              )}
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
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
    backgroundColor: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  optionStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  correctnessStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  correctAnswerContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
}); 