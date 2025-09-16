import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { ScreenshotPrevention } from "@/components/ScreenshotPrevention";
import { translations } from "@/constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LocalTest {
  id: string;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{
      text: string;
      isCorrect?: boolean;
      orderIndex?: number;
    }>;
    correctOptionIndex: number;
    type: number;
  }>;
  openQuestions: Array<{
    id: string;
    text: string;
    points: number;
    correctAnswer: string;
  }>;
}

interface LocalAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  answerText?: string;
  isOpenQuestion: boolean;
}

interface LocalResult {
  testId: string;
  answers: LocalAnswer[];
  timestamp: number;
  correctOpenAnswers?: string[];
}

export default function TestResultDetailScreen() {
  const params = useLocalSearchParams();
  const [test, setTest] = useState<LocalTest | null>(null);
  const [answers, setAnswers] = useState<LocalAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [correctOpenAnswers, setCorrectOpenAnswers] = useState<string[]>([]);

  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const cardBackgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    loadLocalData();
  }, [params.id]);

  const loadLocalData = async () => {
    try {
      setLoading(true);

      // Загружаем сохраненные результаты
      const storedResults = await AsyncStorage.getItem("testResults");
      const results = storedResults ? JSON.parse(storedResults) : {};
      const result: LocalResult = results[params.id as string];

      if (!result) {
        Alert.alert("Ошибка", "Данные результата не найдены");
        router.back();
        return;
      }

      setAnswers(result.answers);
      setCorrectOpenAnswers(result.correctOpenAnswers || []);

      // Загружаем данные теста
      const storedTests = await AsyncStorage.getItem("testData");
      const tests = storedTests ? JSON.parse(storedTests) : {};
      const testData: LocalTest = tests[result.testId];

      if (!testData) {
        Alert.alert("Ошибка", "Данные теста не найдены");
        router.back();
        return;
      }

      setTest(testData);

      // Вычисляем score
      const closedQuestions = testData.questions;
      let correctCount = 0;

      result.answers.forEach(answer => {
        if (!answer.isOpenQuestion && answer.selectedOptionIndex !== undefined) {
          const question = closedQuestions.find(q => q.id === answer.questionId);
          if (question && answer.selectedOptionIndex === question.correctOptionIndex) {
            correctCount++;
          }
        }
      });

      const totalClosed = closedQuestions.length;
      const calculatedScore = totalClosed > 0 ? Math.round((correctCount / totalClosed) * 100) : 0;
      setScore(calculatedScore);

    } catch (error) {
      console.error("Error loading local data:", error);
      Alert.alert("Ошибка", "Не удалось загрузить данные");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = async () => {
    try {
      const storedData = await AsyncStorage.getItem("testResults");
      if (storedData) {
        const results = JSON.parse(storedData);
        delete results[params.id as string];
        await AsyncStorage.setItem("testResults", JSON.stringify(results));
      }
    } catch (error) {
      console.error("Error removing answers:", error);
    } finally {
      router.push("/(tabs)/tests");
    }
  };

  const getAnswerForQuestion = (questionId: string) => {
    return answers.find(a => a.questionId === questionId);
  };

  const isOpenAnswerCorrect = (answerText: string, questionIndex: number) => {
    if (!correctOpenAnswers.length) return false;
    return answerText.trim().toLowerCase() === correctOpenAnswers[questionIndex]?.toLowerCase();
  };

  if (loading || !test) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{translations.loading}</ThemedText>
      </ThemedView>
    );
  }

  const totalQuestions = test.questions.length + test.openQuestions.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenshotPrevention />
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={[styles.returnButton, { backgroundColor: cardBackgroundColor }]}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
          <ThemedText style={[styles.returnButtonText, { color: tintColor }]}>
            {translations.back}
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedText style={styles.title}>{test.title}</ThemedText>
          
          <ThemedView style={[styles.scoreCard, { backgroundColor: cardBackgroundColor }]}>
            <ThemedView style={styles.scoreHeader}>
              <ThemedView style={styles.scorePercentageContainer}>
                <ThemedText style={styles.scoreText}>{score}%</ThemedText>
                <ThemedView style={[styles.scoreBadge, { backgroundColor: score >= 70 ? "#E8F5E9" : "#FFEBEE" }]}>
                  <ThemedText style={[styles.scoreBadgeText, { color: score >= 70 ? "#2E7D32" : "#C62828" }]}>
                    {score >= 70 ? translations.passed : translations.failed}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Закрытые вопросы */}
          {test.questions.map((question, index) => {
            const answer = getAnswerForQuestion(question.id);
            const isCorrect = answer?.selectedOptionIndex === question.correctOptionIndex;

            return (
              <ThemedView key={question.id} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
                <ThemedView style={styles.questionHeader}>
                  <ThemedText style={styles.questionNumber}>
                    {translations.question} {index + 1}
                  </ThemedText>
                  <ThemedView style={[styles.statusBadge, { backgroundColor: isCorrect ? "#E8F5E9" : "#FFEBEE" }]}>
                    <ThemedText style={[styles.statusText, { color: isCorrect ? "#2E7D32" : "#C62828" }]}>
                      {isCorrect ? translations.correct : translations.incorrect}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedText style={styles.questionText}>{question.text}</ThemedText>

                <ThemedView style={styles.optionsContainer}>
                  {question.options.map((option, optionIndex) => {
                    const isSelected = answer?.selectedOptionIndex === optionIndex;
                    const isCorrectOption = optionIndex === question.correctOptionIndex;

                    let optionStyle = {};
                    let circleStyle = {};
                    let textStyle = {};

                    if (isCorrectOption) {
                      optionStyle = styles.correctOption;
                      circleStyle = styles.correctOptionCircle;
                      textStyle = styles.correctOptionText;
                    } else if (isSelected) {
                      optionStyle = styles.selectedOption;
                      circleStyle = styles.selectedOptionCircle;
                      textStyle = styles.selectedOptionText;
                    }

                    return (
                      <ThemedView key={optionIndex} style={[styles.optionContainer, optionStyle]}>
                        <ThemedView style={styles.optionContent}>
                          <ThemedView style={[styles.optionCircle, circleStyle]}>
                            <ThemedText style={[styles.optionNumber, textStyle]}>
                              {String.fromCharCode(65 + optionIndex)}
                            </ThemedText>
                          </ThemedView>
                          <ThemedText style={[styles.optionText, textStyle]}>{option.text}</ThemedText>
                        </ThemedView>
                      </ThemedView>
                    );
                  })}
                </ThemedView>
              </ThemedView>
            );
          })}

          {/* Открытые вопросы */}
          {test.openQuestions.map((question, index) => {
            const answer = getAnswerForQuestion(question.id);
            const isCorrect = isOpenAnswerCorrect(answer?.answerText || "", index);

            return (
              <ThemedView key={question.id} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
                <ThemedView style={styles.questionHeader}>
                  <ThemedText style={styles.questionNumber}>
                    {translations.question} {test.questions.length + index + 1} (Открытый вопрос)
                  </ThemedText>
                  {correctOpenAnswers.length > 0 && (
                    <ThemedView style={[styles.statusBadge, { backgroundColor: isCorrect ? "#E8F5E9" : "#FFEBEE" }]}>
                      <ThemedText style={[styles.statusText, { color: isCorrect ? "#2E7D32" : "#C62828" }]}>
                        {isCorrect ? translations.correct : translations.incorrect}
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>

                <ThemedText style={styles.questionText}>{question.text}</ThemedText>

                <ThemedView style={styles.openAnswerContainer}>
                  <ThemedText style={styles.answerLabel}>Ваш ответ:</ThemedText>
                  <ThemedText style={styles.openAnswerText}>{answer?.answerText || "Нет ответа"}</ThemedText>
                </ThemedView>

                {correctOpenAnswers.length > 0 && !isCorrect && (
                  <ThemedView>
                    <ThemedText style={styles.answerLabel}>Правильный ответ:</ThemedText>
                    <ThemedText>{correctOpenAnswers[index]}</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            );
          })}
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    alignItems: "center",
    justifyContent: "center",
  },
  scorePercentageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    justifyContent: "center",
    minHeight: 60,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#212121",
    lineHeight: 56,
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 36,
    justifyContent: "center",
  },
  scoreBadgeText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  scoreDetails: {
    alignItems: "center",
    paddingTop: 8,
  },
  scoreDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreDetailText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 20,
  },
  questionCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#212121",
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  optionText: {
    fontSize: 16,
    color: "#212121",
  },
  // Стили для выбранного НЕправильного ответа (синий)
  selectedOption: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  selectedOptionCircle: {
    backgroundColor: "#2196F3",
  },
  selectedOptionText: {
    color: "#2196F3",
    fontWeight: "600",
  },
  // Стили для правильного ответа (зеленый)
  correctOption: {
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  correctOptionCircle: {
    backgroundColor: "#2E7D32",
  },
  correctOptionText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  // Стили для НЕ выбранного и НЕ правильного ответа (красный)
  incorrectOption: {
    borderColor: "#C62828",
    backgroundColor: "#FFEBEE",
  },
  incorrectOptionCircle: {
    backgroundColor: "#C62828",
  },
  incorrectOptionText: {
    color: "#C62828",
    fontWeight: "600",
  },
  optionIndicator: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  answerSummary: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    gap: 8,
  },
  answerSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  answerSummaryLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  answerSummaryLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  answerSummaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Стили для открытых вопросов
  openAnswerContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
    marginBottom: 8,
  },
  openAnswerText: {
    fontSize: 16,
    color: "#212121",
    lineHeight: 22,
  },
});
