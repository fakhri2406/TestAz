import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, Alert, TouchableOpacity, Animated } from 'react-native';
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
  const params = useLocalSearchParams();
  const [result, setResult] = useState<TestResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadResult();
  }, [params.id]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const resultData = await api.getTestResultDetail(params.id as string);
      setResult(resultData);
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
            <ThemedView style={styles.scoreHeader}>
              <ThemedView style={styles.scorePercentageContainer}>
                <ThemedText style={styles.scoreText}>
                  {result.score}%
                </ThemedText>
                <ThemedView style={[
                  styles.scoreBadge,
                  { backgroundColor: result.score >= 70 ? '#E8F5E9' : '#FFEBEE' }
                ]}>
                  <ThemedText style={[
                    styles.scoreBadgeText,
                    { color: result.score >= 70 ? '#2E7D32' : '#C62828' }
                  ]}>
                    {result.score >= 70 ? translations.passed : translations.failed}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.scoreDetails}>
              <ThemedView style={styles.scoreDetailItem}>
                <Ionicons name="time" size={24} color="#666" />
                <ThemedText style={styles.scoreDetailText}>
                  {translations.submitted}: {new Date(result.submittedAt).toLocaleDateString()}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {result.answers.map((answer, index) => (
            <ThemedView key={answer.questionId} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedView style={styles.questionHeader}>
                <ThemedView style={styles.questionNumberContainer}>
                  <ThemedText style={styles.questionNumber}>
                    {translations.question} {index + 1}
                  </ThemedText>
                  <ThemedView style={[
                    styles.statusBadge,
                    { backgroundColor: answer.isCorrect ? '#E8F5E9' : '#FFEBEE' }
                  ]}>
                    <ThemedText style={[
                      styles.correctnessStatus,
                      { color: answer.isCorrect ? '#2E7D32' : '#C62828' }
                    ]}>
                      {answer.isCorrect ? translations.correct : translations.incorrect}
                    </ThemedText>
                    <ThemedText style={[
                      styles.pointsStatus,
                      { color: answer.isCorrect ? '#2E7D32' : '#C62828' }
                    ]}>
                      {answer.pointsEarned}/{answer.totalPoints} {translations.points}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>

              <ThemedText style={styles.questionText}>{answer.questionText}</ThemedText>
              
              <ThemedView style={styles.optionsContainer}>
                {answer.options.map((option, optionIndex) => {
                  const isSelected = answer.selectedOptionIndex === optionIndex;
                  const isCorrect = answer.correctOptionIndex === optionIndex;
                  const isSelectedCorrect = isSelected && isCorrect;
                  const isSelectedIncorrect = isSelected && !isCorrect;
                  const isCorrectNotSelected = !isSelected && isCorrect;

                  return (
                    <ThemedView
                      key={optionIndex}
                      style={[
                        styles.optionContainer,
                        isSelectedCorrect && styles.correctOption,
                        isSelectedIncorrect && styles.incorrectOption,
                        isCorrectNotSelected && styles.correctNotSelectedOption
                      ]}
                    >
                      <ThemedView style={styles.optionContent}>
                        <ThemedView style={[
                          styles.optionCircle,
                          isSelectedCorrect && styles.correctOptionCircle,
                          isSelectedIncorrect && styles.incorrectOptionCircle,
                          isCorrectNotSelected && styles.correctNotSelectedCircle
                        ]}>
                          <ThemedText style={[
                            styles.optionNumber,
                            isSelectedCorrect && styles.correctOptionText,
                            isSelectedIncorrect && styles.incorrectOptionText,
                            isCorrectNotSelected && styles.correctNotSelectedText
                          ]}>
                            {String.fromCharCode(65 + optionIndex)}
                          </ThemedText>
                        </ThemedView>
                        <ThemedText style={[
                          styles.optionText,
                          isSelectedCorrect && styles.correctOptionText,
                          isSelectedIncorrect && styles.incorrectOptionText,
                          isCorrectNotSelected && styles.correctNotSelectedText
                        ]}>
                          {option}
                        </ThemedText>
                      </ThemedView>
                      
                      <ThemedView style={styles.optionIndicator}>
                        {isSelectedCorrect && (
                          <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                        )}
                        {isSelectedIncorrect && (
                          <Ionicons name="close-circle" size={24} color="#C62828" />
                        )}
                        {isCorrectNotSelected && (
                          <Ionicons name="checkmark-circle-outline" size={24} color="#2E7D32" />
                        )}
                      </ThemedView>
                    </ThemedView>
                  );
                })}
              </ThemedView>

              <ThemedView style={styles.answerSummary}>
                <ThemedView style={styles.answerSummaryRow}>
                  <ThemedView style={styles.answerSummaryLabel}>
                    <Ionicons 
                      name={answer.isCorrect ? "checkmark-circle" : "close-circle"} 
                      size={20} 
                      color={answer.isCorrect ? "#2E7D32" : "#C62828"} 
                    />
                    <ThemedText style={styles.answerSummaryLabelText}>
                      {translations.yourAnswer}:
                    </ThemedText>
                  </ThemedView>
                  <ThemedText style={[
                    styles.answerSummaryValue,
                    { color: answer.isCorrect ? "#2E7D32" : "#C62828" }
                  ]}>
                    {String.fromCharCode(65 + answer.selectedOptionIndex)}. {answer.options[answer.selectedOptionIndex]}
                  </ThemedText>
                </ThemedView>

                {!answer.isCorrect && (
                  <ThemedView style={styles.answerSummaryRow}>
                    <ThemedView style={styles.answerSummaryLabel}>
                      <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                      <ThemedText style={styles.answerSummaryLabelText}>
                        {translations.correctAnswer}:
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={[styles.answerSummaryValue, { color: "#2E7D32" }]}>
                      {String.fromCharCode(65 + answer.correctOptionIndex)}. {answer.options[answer.correctOptionIndex]}
                    </ThemedText>
                  </ThemedView>
                )}
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
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    marginHorizontal: 16,
    minHeight: 160,
  },
  scoreHeader: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scorePercentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    minHeight: 80,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#212121',
    lineHeight: 44,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 36,
    justifyContent: 'center',
  },
  scoreBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  scoreDetails: {
    alignItems: 'center',
    paddingTop: 16,
    minHeight: 40,
  },
  scoreDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 24,
  },
  scoreDetailText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 20,
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  correctOption: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  incorrectOption: {
    borderColor: '#C62828',
    backgroundColor: '#FFEBEE',
  },
  correctNotSelectedOption: {
    borderColor: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  correctOptionCircle: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  incorrectOptionCircle: {
    backgroundColor: '#C62828',
    borderColor: '#C62828',
  },
  correctNotSelectedCircle: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  correctOptionText: {
    color: '#2E7D32',
  },
  incorrectOptionText: {
    color: '#C62828',
  },
  correctNotSelectedText: {
    color: '#2E7D32',
  },
  optionIndicator: {
    marginLeft: 8,
  },
  answerSummary: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  answerSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerSummaryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  answerSummaryLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  answerSummaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  correctnessStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  pointsStatus: {
    fontSize: 12,
    marginTop: 2,
  },
}); 