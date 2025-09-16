import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { api } from "@/services/api";
import { translations } from "@/constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Option {
  text: string;
  isCorrect?: boolean;
  orderIndex?: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionIndex: number;
  type: number;
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
    questions?: Question[];
  };
  openQuestions?: OpenQuestion[];
}

interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  openQuestions: OpenQuestion[];
}

interface UserAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  answerText?: string;
  isOpenQuestion: boolean;
}

interface ApiAnswer {
  questionId: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  answerText?: string;
}

interface TestSolution {
  testId: string;
  score: number;
  scoreString: string;
  totalQuestions: number;
  correctAnswers: number;
  answers: ApiAnswer[];
  questions: {
    questionId: string;
    correctOptionIndex: number;
  }[];
}

const saveAnswerLocally = async (
  questionId: string,
  answer: number | string,
  isOpenQuestion: boolean
) => {
  try {
    const storedAnswers = await AsyncStorage.getItem("userAnswers");
    let answers = storedAnswers ? JSON.parse(storedAnswers) : {};

    if (isOpenQuestion) {
      answers[questionId] = { text: answer, isOpen: true };
    } else {
      answers[questionId] = { optionIndex: answer, isOpen: false };
    }

    await AsyncStorage.setItem("userAnswers", JSON.stringify(answers));
  } catch (error) {
    console.error("Error saving answer locally:", error);
  }
};

const loadLocalAnswers = async () => {
  try {
    const storedAnswers = await AsyncStorage.getItem("userAnswers");
    return storedAnswers ? JSON.parse(storedAnswers) : {};
  } catch (error) {
    console.error("Error loading local answers:", error);
    return {};
  }
};

const clearLocalAnswers = async () => {
  try {
    await AsyncStorage.removeItem("userAnswers");
    console.log("Local answers cleared from AsyncStorage");
  } catch (error) {
    console.error("Error clearing local answers:", error);
  }
};

export default function TakeTestScreen() {
  const { id } = useLocalSearchParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [closedQuestionAnswers, setClosedQuestionAnswers] = useState<number[]>(
    []
  );
  const [openQuestionAnswers, setOpenQuestionAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const cardBackgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    loadTest();
  }, [id]);

  // Загружаем сохраненные ответы после того как тест загружен
  useEffect(() => {
    if (test) {
      loadSavedAnswers();
    }
  }, [test]);

  const saveTestAnswers = async (
    testId: string,
    answers: UserAnswer[],
    resultId: string
  ) => {
    try {
      const storedData = await AsyncStorage.getItem("testResults");
      let results = storedData ? JSON.parse(storedData) : {};

      results[resultId] = {
        testId,
        answers,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem("testResults", JSON.stringify(results));
      console.log("Test answers saved locally for result:", resultId);
    } catch (error) {
      console.error("Error saving test answers:", error);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      const storedAnswers = await loadLocalAnswers();

      // Загружаем ответы на закрытые вопросы
      const loadedClosedAnswers = test!.questions.map((q) => {
        const saved = storedAnswers[q.id];
        return saved && !saved.isOpen ? saved.optionIndex : -1;
      });
      setClosedQuestionAnswers(loadedClosedAnswers);

      // Загружаем ответы на открытые вопросы
      const loadedOpenAnswers = test!.openQuestions.map((q) => {
        const saved = storedAnswers[q.id];
        return saved && saved.isOpen ? saved.text : "";
      });
      setOpenQuestionAnswers(loadedOpenAnswers);

      console.log("Loaded saved answers:", {
        closed: loadedClosedAnswers,
        open: loadedOpenAnswers,
      });
    } catch (err) {
      console.error("Error loading saved answers:", err);
    }
  };

  const loadTest = async () => {
    try {
      setLoading(true);

      await clearLocalAnswers();

      const testData: TestData = await api.getTest(id as string);
      console.log("Raw test data:", JSON.stringify(testData, null, 2));

      const formattedClosedQuestions = Array.isArray(testData.test?.questions)
        ? testData.test.questions.map((q: Question) => {
            const orderedOptions = [...q.options].sort(
              (a: Option, b: Option) =>
                (a.orderIndex || 0) - (b.orderIndex || 0)
            );
            const correctOptionIndex = orderedOptions.findIndex(
              (opt: Option) => opt.isCorrect
            );

            return {
              id: q.id || "",
              text: q.text || "",
              options: orderedOptions,
              correctOptionIndex:
                correctOptionIndex >= 0 ? correctOptionIndex : -1,
              type: q.type || 0,
            };
          })
        : [];

      const formattedOpenQuestions = Array.isArray(testData.openQuestions)
        ? testData.openQuestions.map((oq: OpenQuestion) => ({
            id: oq.id || "",
            text: oq.text || "",
            points: oq.points || 1,
            correctAnswer: oq.correctAnswer || "",
          }))
        : [];

      const formattedTest: Test = {
        id: testData.test?.id || "",
        title: testData.test?.title || "",
        description: testData.test?.description || "",
        questions: formattedClosedQuestions,
        openQuestions: formattedOpenQuestions,
      };

      console.log(
        "Final formatted test:",
        JSON.stringify(formattedTest, null, 2)
      );
      setTest(formattedTest);

      // Инициализируем пустые ответы
      const initialClosedAnswers = Array(formattedClosedQuestions.length).fill(
        -1
      );
      const initialOpenAnswers = Array(formattedOpenQuestions.length).fill("");

      setClosedQuestionAnswers(initialClosedAnswers);
      setOpenQuestionAnswers(initialOpenAnswers);
    } catch (error) {
      console.error("Error loading test:", error);
      Alert.alert(translations.error, translations.failedToLoadTest);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleClosedAnswerSelect = async (
    questionIndex: number,
    optionIndex: number
  ) => {
    const newAnswers = [...closedQuestionAnswers];
    newAnswers[questionIndex] = optionIndex;
    setClosedQuestionAnswers(newAnswers);

    if (test) {
      await saveAnswerLocally(
        test.questions[questionIndex].id,
        optionIndex,
        false
      );
    }
  };

  const handleOpenAnswerChange = async (
    questionIndex: number,
    text: string
  ) => {
    const newAnswers = [...openQuestionAnswers];
    newAnswers[questionIndex] = text;
    setOpenQuestionAnswers(newAnswers);

    if (test) {
      await saveAnswerLocally(test.openQuestions[questionIndex].id, text, true);
    }
  };

  const handleSubmit = async () => {
    if (closedQuestionAnswers.some((answer) => answer === -1)) {
      Alert.alert(translations.warning, translations.answerAllQuestions);
      return;
    }

    if (openQuestionAnswers.some((answer) => answer.trim() === "")) {
      Alert.alert(translations.warning, translations.answerAllQuestions);
      return;
    }

    if (!test?.id) {
      Alert.alert(translations.error, translations.testDataIncomplete);
      return;
    }

    try {
      setSubmitting(true);

      const apiAnswers: ApiAnswer[] = [];

      closedQuestionAnswers.forEach((selectedOptionIndex, index) => {
        const question = test.questions[index];
        apiAnswers.push({
          questionId: question.id,
          selectedOptionIndex,
          correctOptionIndex: question.correctOptionIndex,
          isCorrect: selectedOptionIndex === question.correctOptionIndex,
        });
      });

      openQuestionAnswers.forEach((answerText, index) => {
        const question = test.openQuestions[index];
        apiAnswers.push({
          questionId: question.id,
          selectedOptionIndex: -1,
          correctOptionIndex: -1,
          isCorrect: false,
          answerText,
        });
      });

      const correctAnswersCount = test.questions.reduce(
        (count, question, index) =>
          count +
          (closedQuestionAnswers[index] === question.correctOptionIndex
            ? 1
            : 0),
        0
      );

      const closedCount = test.questions.length;
      const totalCount = test.questions.length + test.openQuestions.length;
      const score = closedCount > 0
        ? Math.round((correctAnswersCount / closedCount) * 100)
        : 0;

      const solution: TestSolution = {
        testId: test.id,
        score,
        scoreString: `${correctAnswersCount}/${closedCount}`,
        totalQuestions: totalCount,
        correctAnswers: correctAnswersCount,
        answers: apiAnswers,
        questions: [
          ...test.questions.map((q) => ({
            questionId: q.id,
            correctOptionIndex: q.correctOptionIndex,
          })),
          ...test.openQuestions.map((oq) => ({
            questionId: oq.id,
            correctOptionIndex: -1,
          })),
        ],
      };

      const response = await api.submitTestSolution(solution);

      const formattedId = response.id?.toString() || "";
      const guidFormat =
        formattedId.length === 32
          ? `${formattedId.slice(0, 8)}-${formattedId.slice(
              8,
              12
            )}-${formattedId.slice(12, 16)}-${formattedId.slice(
              16,
              20
            )}-${formattedId.slice(20)}`
          : formattedId;

      const userAnswers: UserAnswer[] = [];
      closedQuestionAnswers.forEach((selectedOptionIndex, index) => {
        userAnswers.push({
          questionId: test.questions[index].id,
          selectedOptionIndex,
          isOpenQuestion: false,
        });
      });
      openQuestionAnswers.forEach((answerText, index) => {
        userAnswers.push({
          questionId: test.openQuestions[index].id,
          answerText,
          isOpenQuestion: true,
        });
      });

      await saveTestAnswers(test.id, userAnswers, guidFormat);

      router.push(`/test/result/${guidFormat}`);
    } catch (error) {
      console.error("Error submitting test:", error);
      Alert.alert(translations.error, translations.failedToSubmitTest);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !test) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{translations.loadingTest}</ThemedText>
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
            {translations.returnToTests}
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedText style={styles.title}>{test.title}</ThemedText>
          <ThemedText style={styles.description}>{test.description}</ThemedText>

          {test.questions.map((question, questionIndex) => (
            <ThemedView
              key={question.id}
              style={[
                styles.questionCard,
                { backgroundColor: cardBackgroundColor },
              ]}
            >
              <ThemedText style={styles.questionNumber}>
                {translations.question} {questionIndex + 1} (
                {translations.multipleChoice})
              </ThemedText>
              <ThemedText style={styles.questionText}>
                {question.text}
              </ThemedText>

              {question.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionContainer,
                    closedQuestionAnswers[questionIndex] === optionIndex && {
                      borderColor: tintColor,
                    },
                  ]}
                  onPress={async () => {
                    await handleClosedAnswerSelect(questionIndex, optionIndex);
                  }}
                >
                  <ThemedText style={styles.optionText}>
                    {option.text}
                  </ThemedText>
                  {closedQuestionAnswers[questionIndex] === optionIndex && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={tintColor}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>
          ))}

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
                {test.questions.length + questionIndex + 1} (
                {translations.openQuestion})
              </ThemedText>
              <ThemedText style={styles.questionText}>
                {question.text}
              </ThemedText>

              <TextInput
                style={[styles.textInput, { borderColor: tintColor }]}
                multiline
                numberOfLines={4}
                placeholder={translations.typeYourAnswer}
                value={openQuestionAnswers[questionIndex]}
                onChangeText={async (text) => {
                  await handleOpenAnswerChange(questionIndex, text);
                }}
              />
            </ThemedView>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <ThemedText
            style={[styles.submitButtonText, { color: backgroundColor }]}
          >
            {submitting
              ? translations.submitting
              : `${translations.submitTest} (${totalQuestions} ${translations.questions})`}
          </ThemedText>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
