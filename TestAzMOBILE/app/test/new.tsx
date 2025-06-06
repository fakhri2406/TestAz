import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { api } from '@/services/api';
import { useRouter } from 'expo-router';

interface Question {
  text: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

export default function NewTestScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const router = useRouter();

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'card');

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    if (field === 'text') {
      newQuestions[index].text = value;
    }
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: 'text' | 'isCorrect', value: any) => {
    const newQuestions = [...questions];
    if (field === 'text') {
      newQuestions[questionIndex].options[optionIndex].text = value;
    } else if (field === 'isCorrect') {
      // Set all options to false first
      newQuestions[questionIndex].options.forEach(opt => opt.isCorrect = false);
      // Then set the selected option to true
      newQuestions[questionIndex].options[optionIndex].isCorrect = value;
    }
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!title.trim()) {
        Alert.alert(translations.error, translations.pleaseEnter + ' ' + translations.testTitle);
        return;
      }

      if (!description.trim()) {
        Alert.alert(translations.error, translations.pleaseEnter + ' ' + translations.testDescription);
        return;
      }

      const invalidQuestions = questions.some(q => 
        !q.text.trim() || 
        q.options.some(opt => !opt.text.trim()) ||
        !q.options.some(opt => opt.isCorrect)
      );

      if (invalidQuestions) {
        Alert.alert(translations.error, translations.pleaseFillQuestionsCorrectly);
        return;
      }

      const testData = {
        title,
        description,
        isPremium,
        questions: questions.map(q => ({
          text: q.text,
          options: q.options
        }))
      };

      await api.createTest(testData);
      Alert.alert(translations.success, translations.testCreated, [
        { text: translations.ok, onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating test:', error);
      Alert.alert(translations.error, translations.failedToCreate);
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
            {translations.returnToTests}
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedTextInput
            style={styles.input}
            placeholder={translations.testTitle}
            value={title}
            onChangeText={setTitle}
          />

          <ThemedTextInput
            style={[styles.input, styles.textArea]}
            placeholder={translations.testDescription}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <ThemedView style={[styles.premiumContainer, { backgroundColor: cardBackgroundColor }]}>
            <ThemedText style={styles.premiumLabel}>{translations.premiumTest}</ThemedText>
            <Switch
              value={isPremium}
              onValueChange={setIsPremium}
              trackColor={{ false: '#767577', true: tintColor }}
              thumbColor={isPremium ? '#fff' : '#f4f3f4'}
            />
          </ThemedView>

          {questions.map((question, qIndex) => (
            <ThemedView key={qIndex} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedText style={styles.questionNumber}>{translations.question} {qIndex + 1}</ThemedText>
              
              <ThemedTextInput
                style={styles.input}
                placeholder={translations.questionText}
                value={question.text}
                onChangeText={(text) => updateQuestion(qIndex, 'text', text)}
              />

              {question.options.map((option, oIndex) => (
                <ThemedView key={oIndex} style={[styles.optionContainer, { backgroundColor: cardBackgroundColor }]}>
                  <ThemedTextInput
                    style={styles.optionInput}
                    placeholder={translations.option + ' ' + (oIndex + 1)}
                    value={option.text}
                    onChangeText={(text) => updateOption(qIndex, oIndex, 'text', text)}
                  />
                  <TouchableOpacity
                    style={[
                      styles.correctButton,
                      option.isCorrect && styles.correctButtonActive
                    ]}
                    onPress={() => updateOption(qIndex, oIndex, 'isCorrect', true)}
                  >
                    <ThemedText style={[
                      styles.correctButtonText,
                      option.isCorrect && styles.correctButtonTextActive
                    ]}>
                      {option.isCorrect ? translations.correct : translations.markCorrect}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              ))}

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeQuestion(qIndex)}
              >
                <ThemedText style={styles.removeButtonText}>{translations.removeQuestion}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))}

          <TouchableOpacity
            style={[styles.addQuestionButton, { backgroundColor: cardBackgroundColor }]}
            onPress={addQuestion}
          >
            <ThemedText style={[styles.addQuestionText, { color: tintColor }]}>
              {translations.addQuestion}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmit}
        >
          <ThemedText style={[styles.submitButtonText, { color: backgroundColor }]}>
            {translations.createTest}
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
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  premiumLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  correctButton: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    minWidth: 100,
    alignItems: 'center',
  },
  correctButtonActive: {
    backgroundColor: '#28a745',
  },
  correctButtonText: {
    color: '#495057',
    fontSize: 14,
  },
  correctButtonTextActive: {
    color: '#fff',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
}); 