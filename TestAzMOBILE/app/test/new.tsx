import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { api } from '@/services/api';

interface Question {
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export default function NewTestScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0
  }]);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'card');

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0
    }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!title.trim()) {
        Alert.alert('Error', 'Please enter a test title');
        return;
      }

      if (!description.trim()) {
        Alert.alert('Error', 'Please enter a test description');
        return;
      }

      const invalidQuestions = questions.some(q => 
        !q.text.trim() || 
        q.options.some(opt => !opt.trim()) ||
        q.correctOptionIndex < 0 || 
        q.correctOptionIndex >= q.options.length
      );

      if (invalidQuestions) {
        Alert.alert('Error', 'Please fill in all questions and options correctly');
        return;
      }

      const testData = {
        title,
        description,
        questions: questions.map(q => ({
          text: q.text,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex
        }))
      };

      await api.createTest(testData);
      Alert.alert('Success', 'Test created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating test:', error);
      Alert.alert('Error', 'Failed to create test. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={[styles.returnButton, { backgroundColor: cardBackgroundColor }]}
          onPress={() => router.push('/(tabs)/tests')}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
          <ThemedText style={[styles.returnButtonText, { color: tintColor }]}>
            Return to Tests
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedTextInput
            style={styles.input}
            placeholder="Test Title"
            value={title}
            onChangeText={setTitle}
          />

          <ThemedTextInput
            style={[styles.input, styles.textArea]}
            placeholder="Test Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {questions.map((question, questionIndex) => (
            <ThemedView key={questionIndex} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedText style={styles.questionNumber}>Question {questionIndex + 1}</ThemedText>
              
              <ThemedTextInput
                style={styles.input}
                placeholder="Question Text"
                value={question.text}
                onChangeText={(text) => updateQuestion(questionIndex, 'text', text)}
              />

              {question.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionContainer,
                    question.correctOptionIndex === optionIndex && { borderColor: tintColor }
                  ]}
                  onPress={() => updateQuestion(questionIndex, 'correctOptionIndex', optionIndex)}
                >
                  <ThemedTextInput
                    style={styles.optionInput}
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChangeText={(text) => updateOption(questionIndex, optionIndex, text)}
                  />
                  {question.correctOptionIndex === optionIndex && (
                    <Ionicons name="checkmark-circle" size={24} color={tintColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>
          ))}

          <TouchableOpacity
            style={[styles.addQuestionButton, { backgroundColor: cardBackgroundColor }]}
            onPress={addQuestion}
          >
            <Ionicons name="add-circle-outline" size={24} color={tintColor} />
            <ThemedText style={[styles.addQuestionText, { color: tintColor }]}>
              Add Question
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmit}
        >
          <ThemedText style={[styles.submitButtonText, { color: backgroundColor }]}>
            Create Test
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
  input: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    padding: 8,
  },
  optionInput: {
    flex: 1,
    marginRight: 8,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  addQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 