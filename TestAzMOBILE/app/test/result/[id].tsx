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
  questions: Array<{
    questionId: string;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
  }>;
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
    AnswerText: string;
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
      console.log('Raw result data:', JSON.stringify(resultData, null, 2));
      
      if (resultData.questions) {
        console.log('Test questions with correctOptionIndex:');
        resultData.questions.forEach((q, i) => {
          console.log(`Question ${i + 1}:`, {
            id: q.questionId,
            text: q.questionText,
            correctOptionIndex: q.correctOptionIndex,
            options: q.options
          });
        });
      }

      if (resultData.answers) {
        console.log('Answers with correctOptionIndex:');
        resultData.answers.forEach((a, i) => {
          console.log(`Answer ${i + 1}:`, {
            questionId: a.questionId,
            selectedOptionIndex: a.selectedOptionIndex,
            correctOptionIndex: a.correctOptionIndex,
            isCorrect: a.isCorrect
          });
        });
      }

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

  console.log('Rendering result with answers:', result.answers?.length);

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
                <Ionicons name="calendar" size={24} color="#666" />
                <ThemedText style={styles.scoreDetailText}>
                  {new Date(result.submittedAt).toLocaleDateString()}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {result.questions && result.questions.length > 0 ? (
            result.questions.map((question, index) => {
              const answer = result.answers.find(a => a.questionId === question.questionId);
              console.log('Rendering question:', index + 1, question.questionText);
              return (
                <ThemedView key={question.questionId} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
                  <ThemedView style={styles.questionHeader}>
                    <ThemedText style={styles.questionNumber}>
                      {translations.question} {index + 1}
                    </ThemedText>
                    {answer && (
                      <ThemedView style={[
                        styles.statusBadge,
                        { backgroundColor: answer.isCorrect ? '#E8F5E9' : '#FFEBEE' }
                      ]}>
                        <ThemedText style={[
                          styles.statusText,
                          { color: answer.isCorrect ? '#2E7D32' : '#C62828' }
                        ]}>
                          {answer.isCorrect ? translations.correct : translations.incorrect}
                        </ThemedText>
                      </ThemedView>
                    )}
                  </ThemedView>

                  <ThemedText style={styles.questionText}>{question.questionText}</ThemedText>
                  
                  <ThemedView style={styles.optionsContainer}>
                    {question.options.map((option, optionIndex) => {
                      const isCorrect = optionIndex === answer?.correctOptionIndex;
                      const isSelected = answer?.selectedOptionIndex === optionIndex;

                      return (
                        <ThemedView
                          key={optionIndex}
                          style={[
                            styles.optionContainer,
                            isCorrect ? styles.correctOption : styles.incorrectOption
                          ]}
                        >
                          <ThemedView style={styles.optionContent}>
                            <ThemedView style={[
                              styles.optionCircle,
                              isCorrect ? styles.correctOptionCircle : styles.incorrectOptionCircle
                            ]}>
                              <ThemedText style={[
                                styles.optionNumber,
                                isCorrect ? styles.correctOptionText : styles.incorrectOptionText
                              ]}>
                                {String.fromCharCode(65 + optionIndex)}
                              </ThemedText>
                            </ThemedView>
                            <ThemedText style={[
                              styles.optionText,
                              isCorrect ? styles.correctOptionText : styles.incorrectOptionText
                            ]}>
                              {option}
                            </ThemedText>
                          </ThemedView>
                          
                          <ThemedView style={styles.optionIndicator}>
                            {isCorrect ? (
                              <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                            ) : (
                              <Ionicons name="close-circle" size={24} color="#C62828" />
                            )}
                          </ThemedView>
                        </ThemedView>
                      );
                    })}
                  </ThemedView>

                  {answer && !answer.isCorrect && (
                    <ThemedView style={styles.answerSummary}>
                      <ThemedView style={styles.answerSummaryRow}>
                        <ThemedView style={styles.answerSummaryLabel}>
                          <Ionicons name="close-circle" size={20} color="#C62828" />
                          <ThemedText style={styles.answerSummaryLabelText}>
                            {translations.yourAnswer}:
                          </ThemedText>
                        </ThemedView>
                        <ThemedText style={[styles.answerSummaryValue, { color: "#C62828" }]}>
                          {String.fromCharCode(65 + answer.selectedOptionIndex)}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.answerSummaryRow}>
                        <ThemedView style={styles.answerSummaryLabel}>
                          <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                          <ThemedText style={styles.answerSummaryLabelText}>
                            {translations.correctAnswer}:
                          </ThemedText>
                        </ThemedView>
                        <ThemedText style={[styles.answerSummaryValue, { color: "#2E7D32" }]}>
                          {String.fromCharCode(65 + answer.correctOptionIndex)}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  )}
                </ThemedView>
              );
            })
          ) : (
            <ThemedView style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedText style={styles.questionText}>No questions available</ThemedText>
            </ThemedView>
          )}
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
    minHeight: 140,
  },
  scoreHeader: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    minHeight: 60,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#212121',
    lineHeight: 56,
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
    paddingTop: 8,
  },
  scoreDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreDetailText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 20,
  },
  questionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#212121',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  optionText: {
    fontSize: 16,
    color: '#212121',
  },
  incorrectOption: {
    borderColor: '#C62828',
    backgroundColor: '#FFEBEE',
  },
  correctOption: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  incorrectOptionCircle: {
    backgroundColor: '#C62828',
  },
  correctOptionCircle: {
    backgroundColor: '#2E7D32',
  },
  incorrectOptionText: {
    color: '#C62828',
    fontWeight: '600',
  },
  correctOptionText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  optionIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
  },
}); 