import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api } from '@/services/api';
import { translations } from '@/constants/translations';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function TakeTestScreen() {
  const { id } = useLocalSearchParams();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadTest();
  }, [id]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const testData = await api.getTest(id as string);
      console.log('Raw test data:', JSON.stringify(testData, null, 2));

      // Ensure we have a properly formatted test object
      const formattedTest: Test = {
        id: testData.id || '',
        title: testData.title || '',
        description: testData.description || '',
        questions: Array.isArray(testData.questions) 
          ? testData.questions.map(q => {
              console.log('Processing question:', {
                id: q.id,
                text: q.text,
                options: q.options
              });

              // Sort options by orderIndex and keep the full object
              const orderedOptions = [...q.options].sort((a, b) => a.orderIndex - b.orderIndex);
              const correctOptionIndex = orderedOptions.findIndex(opt => opt.isCorrect) >= 0 ? orderedOptions.findIndex(opt => opt.isCorrect) : -1;

              const formattedQuestion = {
                id: q.id || '',
                text: q.text || '',
                options: orderedOptions, // keep full option objects
                correctOptionIndex: correctOptionIndex
              };

              console.log('Formatted question:', formattedQuestion);
              return formattedQuestion;
            })
          : []
      };

      console.log('Final formatted test:', JSON.stringify(formattedTest, null, 2));
      setTest(formattedTest);
      // Initialize answers array with -1 (no answer selected)
      setAnswers(new Array(formattedTest.questions.length).fill(-1));
    } catch (error) {
      console.error('Error loading test:', error);
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
    // Check if all questions are answered
    if (answers.some(answer => answer === -1)) {
      Alert.alert(translations.warning, translations.answerAllQuestions);
      return;
    }

    if (!test?.id) {
      Alert.alert(translations.error, translations.testDataIncomplete);
      return;
    }

    try {
      setSubmitting(true);

      // Calculate correct answers and prepare submission data
      const correctAnswersCount = test.questions.reduce((count, question, index) => {
        return count + (answers[index] === question.correctOptionIndex ? 1 : 0);
      }, 0);
      
      const totalQuestions = test.questions.length;
      const score = Math.round((correctAnswersCount / totalQuestions) * 100);

      // Prepare answers array with selectedOptionIndex
      const submissionAnswers = answers.map((selectedOptionIndex, index) => ({
        questionId: test.questions[index].id,
        selectedOptionIndex: selectedOptionIndex,
        correctOptionIndex: test.questions[index].correctOptionIndex
      }));

      // Submit the solution
      const solution = {
        testId: test.id,
        score: score,
        scoreString: `${correctAnswersCount}/${totalQuestions}`,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswersCount,
        answers: submissionAnswers,
        questions: test.questions.map(q => ({
          questionId: q.id,
          correctOptionIndex: q.correctOptionIndex
        }))
      };

      console.log('Submitting solution:', {
        correctAnswersCount,
        totalQuestions,
        score,
        scoreString: solution.scoreString,
        questions: solution.questions
      });

      const response = await api.submitTestSolution(solution);
      
      // Format the ID to ensure it's a valid GUID
      const formattedId = response.id?.toString() || '';
      const guidFormat = formattedId.length === 32 
        ? `${formattedId.slice(0, 8)}-${formattedId.slice(8, 12)}-${formattedId.slice(12, 16)}-${formattedId.slice(16, 20)}-${formattedId.slice(20)}`
        : formattedId;
      
      // Redirect directly to results page
      router.push(`/test/result/${guidFormat}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      Alert.alert(
        translations.error,
        translations.failedToSubmitTest
      );
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
          style={[styles.returnButton, { backgroundColor: cardBackgroundColor }]}
          onPress={() => router.push('/(tabs)/tests')}
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
            <ThemedView key={question.id} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedText style={styles.questionNumber}>
                {translations.question} {questionIndex + 1}
              </ThemedText>
              <ThemedText style={styles.questionText}>{question.text}</ThemedText>

              {question.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionContainer,
                    answers[questionIndex] === optionIndex && { borderColor: tintColor }
                  ]}
                  onPress={() => handleAnswerSelect(questionIndex, optionIndex)}
                >
                  <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                  {answers[questionIndex] === optionIndex && (
                    <Ionicons name="checkmark-circle" size={24} color={tintColor} />
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
          <ThemedText style={[styles.submitButtonText, { color: backgroundColor }]}>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
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
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 