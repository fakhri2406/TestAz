import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { api } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { translations } from "@/constants/translations";

// Helper function to format questions with lists
const formatQuestionText = (text: string): string => {
  // Add line breaks before numbered list items (1., 2., etc. or 1), 2), etc.)
  return text.replace(/(\d+[\.)]\s*)/g, '\n$1');
};

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface OpenQuestion {
  id: string;
  text: string;
  points: number;
  correctAnswer: string;
}

interface TestData {
  test?: {
    id: string;
    title: string;
    description: string;
    isPremium: boolean;
    questions?: Question[];
  };
  openQuestions?: OpenQuestion[];
}

interface Test {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
  questions: Question[];
  openQuestions: OpenQuestion[];
}

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const cardBackgroundColor = useThemeColor({}, "card");

  useEffect(() => {
    checkAdminStatus();
    loadTest();
  }, [id]);

  const checkAdminStatus = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser?.id) {
        const userData = await api.getUserById(currentUser.id);
        setIsAdmin(userData.role === "Admin");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  // Добавьте эту функцию в начало файла TestDetailScreen
  const safeLog = (label: string, obj: any, maxLength: number = 1000) => {
    try {
      const jsonString = JSON.stringify(obj, null, 2);
      if (jsonString.length > maxLength) {
        console.log(
          `${label} (truncated):`,
          jsonString.substring(0, maxLength) + "..."
        );
      } else {
        console.log(`${label}:`, jsonString);
      }
    } catch (error) {
      console.log(
        `${label} (could not stringify):`,
        typeof obj,
        Object.keys(obj || {})
      );
    }
  };

  // И используйте в loadTest вместо JSON.stringify:
  const loadTest = async () => {
    try {
      setLoading(true);
      const testData: TestData = await api.getTest(id as string);

      // Безопасное логирование
      safeLog("Test data", testData, 2000);

      if (testData) {
        const formattedTest: Test = {
          id: testData.test?.id || "",
          title: testData.test?.title || "",
          description: testData.test?.description || "",
          isPremium: testData.test?.isPremium || false,
          questions: testData.test?.questions || [],
          openQuestions: testData.openQuestions || [],
        };

        safeLog("Formatted test", formattedTest, 1000);
        setTest(formattedTest);
      } else {
        setTest(null);
      }
    } catch (error) {
      console.error("Error loading test:", error);
      Alert.alert(translations.error, translations.failedToLoadTests);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = () => {
    Alert.alert(translations.deleteTest, translations.deleteTestConfirmation, [
      {
        text: translations.cancel,
        style: "cancel",
      },
      {
        text: translations.delete,
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await api.deleteTest(id as string);
            Alert.alert(translations.success, translations.testDeleted);
            router.push("/(tabs)/tests");
          } catch (error) {
            console.error("Error deleting test:", error);
            Alert.alert(translations.error, translations.failedToDeleteTest);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>
          {translations.loading}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!test) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <ThemedText style={styles.errorText}>
          {translations.testNotFound}
        </ThemedText>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: tintColor }]}
          onPress={loadTest}
        >
          <ThemedText style={styles.retryButtonText}>
            {translations.retry}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const totalQuestions = test.questions.length + test.openQuestions.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={[
            styles.returnButton,
            { backgroundColor: cardBackgroundColor },
          ]}
          onPress={() => router.push("/(tabs)/tests")}
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
                  <ThemedText
                    style={[styles.premiumText, { color: tintColor }]}
                  >
                    {translations.premium}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
            {isAdmin && (
              <ThemedView style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: "#0A84FF" }]}
                  onPress={() =>
                    router.push({
                      pathname: "/test/update",
                      params: { id: test.id },
                    })
                  }
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <ThemedText style={styles.editButtonText}>
                    Redaktə et
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: "#dc3545", marginLeft: 8 },
                  ]}
                  onPress={handleDeleteTest}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                  <ThemedText style={styles.deleteButtonText}>
                    {translations.delete}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedText style={styles.description}>{test.description}</ThemedText>

          {/* Показываем общее количество вопросов */}
          <ThemedText style={styles.questionsCount}>
            Cəmi suallar: {totalQuestions} (Bağlı: {test.questions.length},
            Açıq: {test.openQuestions.length})
          </ThemedText>

          <ThemedView style={styles.questionsContainer}>
            {/* ЗАКРЫТЫЕ ВОПРОСЫ */}
            {test.questions && test.questions.length > 0 && (
              <>
                <ThemedText style={styles.sectionTitle}>
                  Bağlı suallar:
                </ThemedText>
                {test.questions.map((question, questionIndex) => (
                  <ThemedView
                    key={question.id}
                    style={[
                      styles.questionCard,
                      { backgroundColor: cardBackgroundColor },
                    ]}
                  >
                    <ThemedText style={styles.questionNumber}>
                      {translations.question} {questionIndex + 1} (Bağlı)
                    </ThemedText>
                    <ThemedText style={styles.questionText}>
                      {formatQuestionText(question.text)}
                    </ThemedText>

                    <ThemedView style={styles.optionsContainer}>
                      {question.options
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((option, optionIndex) => (
                          <ThemedView
                            key={option.id}
                            style={[
                              styles.optionContainer,
                              option.isCorrect && { borderColor: "#4CAF50" },
                            ]}
                          >
                            <ThemedText style={styles.optionText}>
                              {String.fromCharCode(65 + optionIndex)}) {option.text}
                            </ThemedText>
                            {option.isCorrect && (
                              <ThemedText
                                style={[
                                  styles.correctBadge,
                                  { color: "#4CAF50" },
                                ]}
                              >
                                ✓
                              </ThemedText>
                            )}
                          </ThemedView>
                        ))}
                    </ThemedView>
                  </ThemedView>
                ))}
              </>
            )}

            {/* ОТКРЫТЫЕ ВОПРОСЫ */}
            {test.openQuestions && test.openQuestions.length > 0 && (
              <>
                <ThemedText style={styles.sectionTitle}>
                  Açıq suallar:
                </ThemedText>
                {test.openQuestions.map((question, questionIndex) => (
                  <ThemedView
                    key={question.id}
                    style={[
                      styles.questionCard,
                      { backgroundColor: cardBackgroundColor },
                    ]}
                  >
                    <ThemedText style={styles.questionNumber}>
                      {translations.question}{" "}
                      {test.questions.length + questionIndex + 1} (Açıq)
                    </ThemedText>
                    <ThemedText style={styles.questionText}>
                      {formatQuestionText(question.text)}
                    </ThemedText>
                    <ThemedText style={styles.pointsText}>
                      Xallar: {question.points}
                    </ThemedText>
                    <ThemedView style={styles.correctAnswerContainer}>
                      <ThemedText style={styles.correctAnswerLabel}>
                        Düzgün cavab:
                      </ThemedText>
                      <ThemedText style={styles.correctAnswerText}>
                        {question.correctAnswer}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                ))}
              </>
            )}

            {/* Если нет вопросов вообще */}
            {totalQuestions === 0 && (
              <ThemedView style={styles.noQuestionsContainer}>
                <Ionicons name="help-circle-outline" size={48} color="#666" />
                <ThemedText style={styles.noQuestionsText}>
                  Bu testdə hələ sual yoxdur
                </ThemedText>
              </ThemedView>
            )}
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
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  returnButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  premiumText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  questionsCount: {
    fontSize: 14,
    marginBottom: 24,
    fontWeight: "600",
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 16,
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
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.7,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: "#007AFF",
  },
  optionsContainer: {
    gap: 8,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  correctBadge: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  correctAnswerContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  correctAnswerLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    color: "#4CAF50",
  },
  correctAnswerText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  noQuestionsContainer: {
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  noQuestionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
