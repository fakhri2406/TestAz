import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { api } from "../services/api";
import { API_CONFIG } from "../config/api";
import { translations } from "@/constants/translations";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

interface Question {
  text: string;
  options: AnswerOption[];
}

// Use the API's Test type
type Test = {
  id: string;
  title: string;
  description: string;
  score?: number;
  isPremium?: boolean;
};

interface CreateTestData {
  title: string;
  description: string;
  isPremium: boolean;
  questions: Question[];
}

export default function CreateTest() {
  const router = useRouter();
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const [tests, setTests] = useState<Test[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newTest, setNewTest] = useState<CreateTestData>({
    title: "",
    description: "",
    isPremium: false,
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  // Test API connection on component mount
  useEffect(() => {
    testConnection();
    fetchTests();
  }, []);

  const testConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Testing API connection...");
      const tests = await api.getTests();
      console.log("API connection test response:", tests);
      if (tests) {
        Alert.alert("Success", "API connection successful!");
      }
    } catch (err) {
      console.error("API connection test failed:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to API");
      Alert.alert(
        "Error",
        "Failed to connect to API. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching tests...");
      const tests = await api.getTests();
      console.log("Fetch tests response:", tests);
      if (tests) {
        setTests(tests);
      }
    } catch (err) {
      console.error("Fetch tests failed:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.text.trim()) {
      Alert.alert("Error", "Question text is required");
      return;
    }

    const validOptions = currentQuestion.options.filter(
      (opt) => opt.text.trim() !== ""
    );
    if (validOptions.length < 2) {
      Alert.alert("Error", "At least 2 answer options are required");
      return;
    }

    const correctOptions = validOptions.filter((opt) => opt.isCorrect);
    if (correctOptions.length !== 1) {
      Alert.alert("Error", "Exactly one correct answer must be selected");
      return;
    }

    setNewTest((prev) => ({
      ...prev,
      questions: [...prev.questions, currentQuestion],
    }));

    setCurrentQuestion({
      text: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    setNewTest((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index: number, text: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, text } : opt
      ),
    }));
  };

  const toggleCorrectOption = (index: number) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      })),
    }));
  };

  const createTest = async () => {
    if (newTest.questions.length === 0) {
      Alert.alert("Error", "At least one question is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Creating test with data:", newTest);
      const response = await api.createTest({
        title: newTest.title,
        description: newTest.description,
        isPremium: newTest.isPremium,
        questions: newTest.questions.map((q) => {
          // Find the index of the correct option
          const correctOptionIndex = q.options.findIndex(
            (opt) => opt.isCorrect
          );
          console.log("Question correct option index:", correctOptionIndex);

          return {
            text: q.text,
            correctOptionIndex, // Add the correctOptionIndex
            options: q.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
            })),
          };
        }),
      });
      console.log("Create test response:", response);
      if (response) {
        await fetchTests();
        setNewTest({
          title: "",
          description: "",
          isPremium: false,
          questions: [],
        });
        Alert.alert("Success", "Test created successfully!");
        router.back();
      }
    } catch (err) {
      console.error("Create test failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create test");
      Alert.alert("Error", "Failed to create test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: textColor }]}>
          {translations.addNewTest}
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor, color: textColor, borderColor: iconColor },
          ]}
          placeholder={translations.testTitle}
          placeholderTextColor={iconColor}
          value={newTest.title}
          onChangeText={(text) =>
            setNewTest((prev) => ({ ...prev, title: text }))
          }
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor, color: textColor, borderColor: iconColor },
          ]}
          placeholder={translations.testDescription}
          placeholderTextColor={iconColor}
          value={newTest.description}
          onChangeText={(text) =>
            setNewTest((prev) => ({ ...prev, description: text }))
          }
          multiline
          numberOfLines={3}
        />
        <View style={styles.premiumContainer}>
          <Text style={[styles.premiumLabel, { color: textColor }]}>
            {translations.premiumTest}
          </Text>
          <Switch
            value={newTest.isPremium}
            onValueChange={(value) =>
              setNewTest((prev) => ({ ...prev, isPremium: value }))
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.title, { color: textColor }]}>
          {translations.question}
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor, color: textColor, borderColor: iconColor },
          ]}
          placeholder={translations.questionText}
          placeholderTextColor={iconColor}
          value={currentQuestion.text}
          onChangeText={(text) =>
            setCurrentQuestion((prev) => ({ ...prev, text }))
          }
          multiline
          numberOfLines={2}
        />

        <Text style={[styles.subtitle, { color: textColor }]}>
          {translations.answerOptions}
        </Text>
        {currentQuestion.options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <Text style={[styles.optionLabel, { color: textColor }]}>
              {String.fromCharCode(65 + index)})
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.optionInput,
                { backgroundColor, color: textColor, borderColor: iconColor },
              ]}
              placeholder={`${translations.option} ${String.fromCharCode(65 + index)}`}
              placeholderTextColor={iconColor}
              value={option.text}
              onChangeText={(text) => updateOption(index, text)}
            />
            <TouchableOpacity
              style={[
                styles.correctButton,
                { borderColor: tintColor },
                option.isCorrect && { backgroundColor: tintColor },
              ]}
              onPress={() => toggleCorrectOption(index)}
            >
              <Text
                style={[
                  styles.correctButtonText,
                  { color: option.isCorrect ? backgroundColor : tintColor },
                ]}
              >
                {option.isCorrect ? "✓" : "○"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.button,
            styles.addQuestionButton,
            { backgroundColor: tintColor },
          ]}
          onPress={addQuestion}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={backgroundColor}
          />
          <Text style={[styles.buttonText, { color: backgroundColor }]}>
            {translations.addQuestion}
          </Text>
        </TouchableOpacity>
      </View>

      {newTest.questions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.title, { color: textColor }]}>
            {translations.addedQuestions} ({newTest.questions.length})
          </Text>
          {newTest.questions.map((question, index) => (
            <View
              key={index}
              style={[
                styles.questionItem,
                { backgroundColor, borderColor: iconColor },
              ]}
            >
              <Text style={[styles.questionText, { color: textColor }]}>
                {question.text}
              </Text>
              <Text style={[styles.optionText, { color: textColor }]}>
                {translations.correctAnswer}:{" "}
                {question.options.find((opt) => opt.isCorrect)?.text}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeQuestion(index)}
              >
                <Ionicons name="trash-outline" size={20} color="#dc3545" />
                <Text style={styles.removeButtonText}>
                  {translations.delete}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.createButton,
            { backgroundColor: tintColor },
          ]}
          onPress={createTest}
          disabled={
            loading ||
            !newTest.title ||
            !newTest.description ||
            newTest.questions.length === 0
          }
        >
          <Ionicons name="save-outline" size={24} color={backgroundColor} />
          <Text style={[styles.buttonText, { color: backgroundColor }]}>
            {loading ? translations.saving : translations.save}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.backButton,
            { backgroundColor, borderColor: tintColor },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={tintColor} />
          <Text style={[styles.buttonText, { color: tintColor }]}>
            {translations.back}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: "#f8d7da" }]}>
          <Text style={[styles.errorTitle, { color: "#721c24" }]}>
            {translations.error}:
          </Text>
          <Text style={[styles.error, { color: "#721c24" }]}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
  },
  createButton: {
    backgroundColor: "#007AFF",
  },
  backButton: {
    backgroundColor: "#6c757d",
  },
  testButton: {
    backgroundColor: "#17a2b8",
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#f8d7da",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  errorTitle: {
    color: "#721c24",
    fontWeight: "bold",
    marginBottom: 5,
  },
  error: {
    color: "#721c24",
    fontSize: 16,
  },
  testItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: "#f8f9fa",
  },
  testTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  premiumContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  premiumLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
    minWidth: 30,
  },
  optionInput: {
    flex: 1,
    marginRight: 10,
  },
  correctButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  correctButtonActive: {
    backgroundColor: "#007AFF",
  },
  correctButtonText: {
    fontSize: 20,
    color: "#007AFF",
  },
  addQuestionButton: {
    marginTop: 15,
  },
  questionItem: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  optionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-end",
    gap: 4,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});
