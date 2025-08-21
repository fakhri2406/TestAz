import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
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
}

interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

const saveAnswerLocally = async (
  questionId: string,
  selectedOptionIndex: number
) => {
  try {
    const storedAnswers = await AsyncStorage.getItem("userAnswers");
    let answers = storedAnswers ? JSON.parse(storedAnswers) : {};
    answers[questionId] = selectedOptionIndex;
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
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const cardBackgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    loadTest();
  }, [id]);

  const saveTestAnswers = async (
    testId: string,
    answers: number[],
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

  const loadTest = async () => {
    try {
      setLoading(true);
      
      await clearLocalAnswers();
      
      const testData = await api.getTest(id as string);
      console.log("Raw test data:", JSON.stringify(testData, null, 2));

      const formattedTest: Test = {
        id: testData.id || "",
        title: testData.title || "",
        description: testData.description || "",
        questions: Array.isArray(testData.questions)
          ? testData.questions.map((q) => {
              console.log("Processing question:", {
                id: q.id,
                text: q.text,
                options: q.options,
              });

              const orderedOptions = [...q.options].sort(
                (a, b) => a.orderIndex - b.orderIndex
              );
              const correctOptionIndex =
                orderedOptions.findIndex((opt) => opt.isCorrect) >= 0
                  ? orderedOptions.findIndex((opt) => opt.isCorrect)
                  : -1;

              const formattedQuestion = {
                id: q.id || "",
                text: q.text || "",
                options: orderedOptions,
                correctOptionIndex: correctOptionIndex,
              };

              console.log("Formatted question:", formattedQuestion);
              return formattedQuestion;
            })
          : [],
      };

      console.log(
        "Final formatted test:",
        JSON.stringify(formattedTest, null, 2)
      );
      setTest(formattedTest);
      
      // Устанавливаем пустые ответы (-1 означает "не выбрано")
      const initialAnswers = Array(formattedTest.questions.length).fill(-1);
      setAnswers(initialAnswers);
    } catch (error) {
      console.error("Error loading test:", error);
      Alert.alert(translations.error, translations.failedToLoadTest);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some((answer) => answer === -1)) {
      Alert.alert(translations.warning, translations.answerAllQuestions);
      return;
    }

    if (!test?.id) {
      Alert.alert(translations.error, translations.testDataIncomplete);
      return;
    }

    try {
      setSubmitting(true);

      const correctAnswersCount = test.questions.reduce(
        (count, question, index) =>
          count + (answers[index] === question.correctOptionIndex ? 1 : 0),
        0
      );

      const totalQuestions = test.questions.length;
      const score = Math.round((correctAnswersCount / totalQuestions) * 100);

      const submissionAnswers = answers.map((selectedOptionIndex, index) => {
        const question = test.questions[index];
        const correctOptionIndex = question.correctOptionIndex;

        return {
          questionId: question.id,
          questionText: question.text,
          selectedOptionIndex,
          correctOptionIndex,
          options: question.options.map((opt) => opt.text),
          isCorrect: selectedOptionIndex === correctOptionIndex,
          correctOption: question.options[correctOptionIndex]?.text || "",
          AnswerText: question.options[selectedOptionIndex]?.text || "",
        };
      });

      const solution = {
        testId: test.id,
        score,
        scoreString: `${correctAnswersCount}/${totalQuestions}`,
        totalQuestions,
        correctAnswers: correctAnswersCount,
        answers: submissionAnswers,
        questions: test.questions.map((q) => ({
          questionId: q.id,
          questionText: q.text,
          correctOptionIndex: q.correctOptionIndex,
          options: q.options.map((opt) => opt.text),
        })),
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

      await saveTestAnswers(test.id, answers, guidFormat);

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
                {translations.question} {questionIndex + 1}
              </ThemedText>
              <ThemedText style={styles.questionText}>
                {question.text}
              </ThemedText>

              {question.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionContainer,
                    answers[questionIndex] === optionIndex && {
                      borderColor: tintColor,
                    },
                  ]}
                  onPress={async () => {
                    handleAnswerSelect(questionIndex, optionIndex);
                    await saveAnswerLocally(question.id, optionIndex);
                  }}
                >
                  <ThemedText style={styles.optionText}>
                    {option.text}
                  </ThemedText>
                  {answers[questionIndex] === optionIndex && (
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
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <ThemedText
            style={[styles.submitButtonText, { color: backgroundColor }]}
          >
            {submitting ? translations.submitting : translations.submitTest}
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