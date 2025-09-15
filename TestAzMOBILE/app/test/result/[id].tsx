import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { ScreenshotPrevention } from "@/components/ScreenshotPrevention";
import { translations } from "@/constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    isOpenQuestion?: boolean;
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
    isOpenQuestion?: boolean;
  }>;
}

interface LocalAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  answerText?: string;
  isOpenQuestion: boolean;
}

export default function TestResultDetailScreen() {
  const params = useLocalSearchParams();
  const [result, setResult] = useState<TestResultDetail | null>(null);
  const [localAnswers, setLocalAnswers] = useState<LocalAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const cardBackgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    loadResultAndAnswers();
  }, [params.id]);

  const loadResultAndAnswers = async () => {
    try {
      setLoading(true);

      const resultData = await api.getTestResultDetail(params.id as string);
      setResult(resultData);

      const storedData = await AsyncStorage.getItem("testResults");
      const results = storedData ? JSON.parse(storedData) : {};
      const localResult = results[params.id as string];

      if (localResult && localResult.answers) {
        setLocalAnswers(localResult.answers);
        console.log("Loaded local answers:", localResult.answers);
      } else {
        console.log("No local answers found for result:", params.id);
      }
    } catch (error) {
      console.error("Error loading test result:", error);
      Alert.alert(translations.error, translations.failedToLoadTests);
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
        console.log("Removed answers for test:", params.id);
      }
    } catch (error) {
      console.error("Error removing answers:", error);
    } finally {
      router.push("/(tabs)/tests");
    }
  };

  const getAnswerForQuestion = (questionIndex: number) => {
    if (result?.answers && result.answers.length > 0) {
      const question = result.questions[questionIndex];
      return result.answers.find((a) => a.questionId === question.questionId);
    } else if (localAnswers.length > 0) {
      const question = result?.questions[questionIndex];
      if (!question) return null;

      const localAnswer = localAnswers.find(
        (a) => a.questionId === question.questionId
      );

      if (!localAnswer) return null;

      // Для закрытых вопросов
      if (
        !localAnswer.isOpenQuestion &&
        localAnswer.selectedOptionIndex !== undefined
      ) {
        const selectedOptionIndex = localAnswer.selectedOptionIndex;
        const isCorrect = selectedOptionIndex === question.correctOptionIndex;

        return {
          questionId: question.questionId,
          selectedOptionIndex,
          correctOptionIndex: question.correctOptionIndex,
          isCorrect,
          AnswerText: question.options[selectedOptionIndex] || "",
          options: question.options,
          isOpenQuestion: false,
        };
      }
      // Для открытых вопросов
      else if (localAnswer.isOpenQuestion) {
        return {
          questionId: question.questionId,
          selectedOptionIndex: -1, // Специальное значение для открытых вопросов
          correctOptionIndex: -1,
          isCorrect: false, // Не проверяем открытые вопросы автоматически
          AnswerText: localAnswer.answerText || "",
          options: [],
          isOpenQuestion: true,
        };
      }
    }
    return null;
  };

  if (loading || !result) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{translations.loading}</ThemedText>
      </ThemedView>
    );
  }

  const hasAnswers =
    (result.answers && result.answers.length > 0) || localAnswers.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenshotPrevention />
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={[
            styles.returnButton,
            { backgroundColor: cardBackgroundColor },
          ]}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
          <ThemedText style={[styles.returnButtonText, { color: tintColor }]}>
            {translations.back}
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedText style={styles.title}>{result.testTitle}</ThemedText>
          <ThemedView
            style={[styles.scoreCard, { backgroundColor: cardBackgroundColor }]}
          >
            <ThemedView style={styles.scoreHeader}>
              <ThemedView style={styles.scorePercentageContainer}>
                <ThemedText style={styles.scoreText}>
                  {result.score}%
                </ThemedText>
                <ThemedView
                  style={[
                    styles.scoreBadge,
                    {
                      backgroundColor:
                        result.score >= 70 ? "#E8F5E9" : "#FFEBEE",
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.scoreBadgeText,
                      { color: result.score >= 70 ? "#2E7D32" : "#C62828" },
                    ]}
                  >
                    {result.score >= 70
                      ? translations.passed
                      : translations.failed}
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

          {!hasAnswers ? (
            <ThemedView
              style={[
                styles.questionCard,
                { backgroundColor: cardBackgroundColor },
              ]}
            >
              <ThemedText style={styles.questionText}>
                Данные ответов недоступны
              </ThemedText>
            </ThemedView>
          ) : result.questions && result.questions.length > 0 ? (
            result.questions.map((question, index) => {
              const answer = getAnswerForQuestion(index);

              if (!answer) return null;

              // Для открытых вопросов показываем текстовый ответ
              if (answer.isOpenQuestion) {
                return (
                  <ThemedView
                    key={question.questionId}
                    style={[
                      styles.questionCard,
                      { backgroundColor: cardBackgroundColor },
                    ]}
                  >
                    <ThemedView style={styles.questionHeader}>
                      <ThemedText style={styles.questionNumber}>
                        {translations.question} {index + 1} (Открытый вопрос)
                      </ThemedText>
                    </ThemedView>

                    <ThemedText style={styles.questionText}>
                      {question.questionText}
                    </ThemedText>

                    <ThemedView style={styles.openAnswerContainer}>
                      <ThemedText style={styles.answerLabel}>
                        Ваш ответ:
                      </ThemedText>
                      <ThemedText style={styles.openAnswerText}>
                        {answer.AnswerText || "Нет ответа"}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                );
              }

              // Для закрытых вопросов
              return (
                <ThemedView
                  key={question.questionId}
                  style={[
                    styles.questionCard,
                    { backgroundColor: cardBackgroundColor },
                  ]}
                >
                  <ThemedView style={styles.questionHeader}>
                    <ThemedText style={styles.questionNumber}>
                      {translations.question} {index + 1}
                    </ThemedText>
                    <ThemedView
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: answer.isCorrect
                            ? "#E8F5E9"
                            : "#FFEBEE",
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.statusText,
                          { color: answer.isCorrect ? "#2E7D32" : "#C62828" },
                        ]}
                      >
                        {answer.isCorrect
                          ? translations.correct
                          : translations.incorrect}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>

                  <ThemedText style={styles.questionText}>
                    {question.questionText}
                  </ThemedText>

                  <ThemedView style={styles.optionsContainer}>
                    {question.options.map((option, optionIndex) => {
                      const isCorrect =
                        optionIndex === question.correctOptionIndex;
                      const isSelected =
                        optionIndex === answer.selectedOptionIndex;
                      const isIncorrectOption = !isCorrect && !isSelected;

                      let optionStyle = {};
                      let circleStyle = {};
                      let textStyle = {};
                      let icon = null;

                      if (isCorrect) {
                        // Правильный ответ - зеленый
                        optionStyle = styles.correctOption;
                        circleStyle = styles.correctOptionCircle;
                        textStyle = styles.correctOptionText;
                        icon = (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#2E7D32"
                          />
                        );
                      } else if (isSelected) {
                        // Выбранный НЕправильный ответ - синий
                        optionStyle = styles.selectedOption;
                        circleStyle = styles.selectedOptionCircle;
                        textStyle = styles.selectedOptionText;
                        icon = (
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color="#2196F3" // Синий цвет вместо красного
                          />
                        );
                      } else if (isIncorrectOption) {
                        // НЕ выбранный и НЕ правильный - красный
                        optionStyle = styles.incorrectOption;
                        circleStyle = styles.incorrectOptionCircle;
                        textStyle = styles.incorrectOptionText;
                        icon = (
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color="#C62828" // Красный цвет
                          />
                        );
                      } else {
                        // Обычный вариант (не должен срабатывать)
                        optionStyle = {};
                        circleStyle = {};
                        textStyle = {};
                        icon = null;
                      }

                      return (
                        <ThemedView
                          key={optionIndex}
                          style={[styles.optionContainer, optionStyle]}
                        >
                          <ThemedView style={styles.optionContent}>
                            <ThemedView
                              style={[styles.optionCircle, circleStyle]}
                            >
                              <ThemedText
                                style={[styles.optionNumber, textStyle]}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </ThemedText>
                            </ThemedView>
                            <ThemedText style={[styles.optionText, textStyle]}>
                              {option}
                            </ThemedText>
                          </ThemedView>

                          {icon && (
                            <ThemedView style={styles.optionIndicator}>
                              {icon}
                            </ThemedView>
                          )}
                        </ThemedView>
                      );
                    })}
                  </ThemedView>

                  {!answer.isCorrect && (
                    <ThemedView style={styles.answerSummary}>
                      <ThemedView style={styles.answerSummaryRow}>
                        <ThemedView style={styles.answerSummaryLabel}>
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#2196F3" // Синий цвет
                          />
                          <ThemedText style={styles.answerSummaryLabelText}>
                            {translations.yourAnswer}:
                          </ThemedText>
                        </ThemedView>
                        <ThemedText
                          style={[
                            styles.answerSummaryValue,
                            { color: "#2196F3" }, // Синий цвет
                          ]}
                        >
                          {String.fromCharCode(65 + answer.selectedOptionIndex)}
                        </ThemedText>
                      </ThemedView>

                      <ThemedView style={styles.answerSummaryRow}>
                        <ThemedView style={styles.answerSummaryLabel}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#2E7D32"
                          />
                          <ThemedText style={styles.answerSummaryLabelText}>
                            {translations.correctAnswer}:
                          </ThemedText>
                        </ThemedView>
                        <ThemedText
                          style={[
                            styles.answerSummaryValue,
                            { color: "#2E7D32" },
                          ]}
                        >
                          {String.fromCharCode(65 + answer.correctOptionIndex)}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  )}
                </ThemedView>
              );
            })
          ) : (
            <ThemedView
              style={[
                styles.questionCard,
                { backgroundColor: cardBackgroundColor },
              ]}
            >
              <ThemedText style={styles.questionText}>
                No questions available
              </ThemedText>
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
