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
import { translations } from '@/constants/translations';

interface TestResultDetail {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
  totalPossiblePoints: number;
  earnedPoints: number;
  answers: Array<{
    questionId: string;
    questionText: string;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    options: string[];
    isCorrect: boolean;
    correctOption: string;
    pointsEarned: number;
    totalPoints: number;
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

      // Transform the data to ensure options are strings
      const transformedData = {
        ...resultData,
        answers: resultData.answers.map(answer => ({
          ...answer,
          options: answer.options.map(option => 
            typeof option === 'string' 
              ? option 
              : typeof option === 'object' && option !== null
                ? option.text || option.Text || ''
                : String(option)
          )
        }))
      };

      console.log('Transformed answers:', transformedData.answers.map(a => ({
        questionText: a.questionText,
        selectedIndex: a.selectedOptionIndex,
        correctIndex: a.correctOptionIndex,
        options: a.options,
        isCorrect: a.isCorrect,
        correctOption: a.correctOption
      })));

      setResult(transformedData);
    } catch (error) {
      console.error('Error loading test result:', error);
      Alert.alert(translations.error, translations.failedToLoadTests);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading || !result) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{translations.loading}</ThemedText>
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
            {translations.back}
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedText style={styles.title}>{result.testTitle}</ThemedText>
          <ThemedView style={[styles.scoreCard, { backgroundColor: cardBackgroundColor }]}>
            <ThemedText style={styles.scoreText}>
              {translations.score}: {result.score}
            </ThemedText>
            <ThemedText style={styles.pointsText}>
              {translations.points}: {result.earnedPoints}/{result.totalPossiblePoints}
            </ThemedText>
            <ThemedText style={styles.submittedText}>
              {translations.submitted}: {new Date(result.submittedAt).toLocaleDateString()}
            </ThemedText>
          </ThemedView>

          {result.answers.map((answer, index) => (
            <ThemedView key={answer.questionId} style={[styles.answerCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedView style={styles.questionHeader}>
                <ThemedText style={styles.questionNumber}>{translations.question} {index + 1}</ThemedText>
                <ThemedView style={styles.questionStatus}>
                  <ThemedText style={[
                    styles.correctnessStatus,
                    { color: answer.isCorrect ? '#4CAF50' : '#f44336' }
                  ]}>
                    {answer.isCorrect ? translations.correct : translations.incorrect}
                  </ThemedText>
                  <ThemedText style={styles.pointsStatus}>
                    {translations.points}: {answer.pointsEarned}/{answer.totalPoints}
                  </ThemedText>
                </ThemedView>
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
                      {optionIndex + 1}. {option}
                    </ThemedText>
                    {answer.selectedOptionIndex === optionIndex && (
                      <ThemedText style={[styles.optionStatus, { color: answer.isCorrect ? '#4CAF50' : '#f44336' }]}>
                        {answer.isCorrect ? '✓' : '✗'}
                      </ThemedText>
                    )}
                    {answer.correctOptionIndex === optionIndex && answer.selectedOptionIndex !== optionIndex && (
                      <ThemedText style={[styles.optionStatus, { color: '#4CAF50' }]}>
                        ✓
                      </ThemedText>
                    )}
                  </ThemedView>
                ))}
              </ThemedView>
              {!answer.isCorrect && (
                <ThemedView style={styles.correctAnswerContainer}>
                  <ThemedText style={styles.correctAnswerLabel}>{translations.yourAnswer}:</ThemedText>
                  <ThemedText style={[styles.correctAnswerText, { color: '#f44336' }]}>
                    {answer.selectedOptionIndex >= 0 && answer.options[answer.selectedOptionIndex] 
                      ? `${answer.selectedOptionIndex + 1}. ${answer.options[answer.selectedOptionIndex]}`
                      : translations.noAnswerSelected}
                  </ThemedText>
                  <ThemedText style={[styles.correctAnswerLabel, { marginTop: 8 }]}>{translations.correctAnswer}:</ThemedText>
                  <ThemedText style={[styles.correctAnswerText, { color: '#4CAF50' }]}>
                    {answer.correctOption
                      ? `${answer.correctOptionIndex + 1}. ${answer.correctOption}`
                      : translations.noCorrectAnswerFound}
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
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
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
  questionStatus: {
    alignItems: 'flex-end',
  },
  pointsStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 