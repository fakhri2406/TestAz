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

interface ClosedQuestion {
  type: 'closed';
  text: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

interface OpenQuestion {
  type: 'open';
  text: string;
  correctAnswer: string;
  points: number;
}

type Question = ClosedQuestion | OpenQuestion;

export default function NewTestScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const router = useRouter();

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'background');

  const addClosedQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: 'closed',
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

  const addOpenQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: 'open',
        text: '',
        correctAnswer: '',
        points: 1
      }
    ]);
  };

  const updateClosedQuestion = (index: number, field: keyof ClosedQuestion, value: any) => {
    const newQuestions = [...questions];
    if (newQuestions[index].type === 'closed') {
      if (field === 'text') {
        newQuestions[index].text = value;
      }
      setQuestions(newQuestions);
    }
  };

  const updateOpenQuestion = (index: number, field: keyof OpenQuestion, value: any) => {
    const newQuestions = [...questions];
    if (newQuestions[index].type === 'open') {
      const openQuestion = newQuestions[index] as OpenQuestion;
      if (field === 'text') {
        openQuestion.text = value;
      } else if (field === 'correctAnswer') {
        openQuestion.correctAnswer = value;
      } else if (field === 'points') {
        openQuestion.points = value;
      }
      setQuestions(newQuestions);
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: 'text' | 'isCorrect', value: any) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].type === 'closed') {
      const closedQuestion = newQuestions[questionIndex] as ClosedQuestion;
      if (field === 'text') {
        closedQuestion.options[optionIndex].text = value;
      } else if (field === 'isCorrect') {
        // Set all options to false first
        closedQuestion.options.forEach(opt => opt.isCorrect = false);
        // Then set the selected option to true
        closedQuestion.options[optionIndex].isCorrect = value;
      }
      setQuestions(newQuestions);
    }
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

      // Validate closed questions
      const invalidClosedQuestions = questions.some(q => {
        if (q.type === 'closed') {
          return !q.text.trim() || 
                 q.options.some(opt => !opt.text.trim()) ||
                 !q.options.some(opt => opt.isCorrect);
        }
        return false;
      });

      // Validate open questions
      const invalidOpenQuestions = questions.some(q => {
        if (q.type === 'open') {
          return !q.text.trim() || !q.correctAnswer.trim() || q.points <= 0;
        }
        return false;
      });

      if (invalidClosedQuestions) {
        Alert.alert(translations.error, translations.pleaseFillQuestionsCorrectly);
        return;
      }

      if (invalidOpenQuestions) {
        Alert.alert(translations.error, 'Zəhmət olmasa bütün açıq sualları düzgün cavab və xallarla doldurun');
        return;
      }

      // Separate closed and open questions
      const closedQuestions = questions.filter(q => q.type === 'closed') as ClosedQuestion[];
      const openQuestions = questions.filter(q => q.type === 'open') as OpenQuestion[];

      // Create test with closed questions first
      const testData = {
        title,
        description,
        isPremium,
        questions: closedQuestions.map(q => ({
          text: q.text,
          options: q.options
        }))
      };

      const createdTest = await api.createTest(testData);
      
      // Add open questions to the created test
      if (openQuestions.length > 0 && createdTest.id) {
        for (const openQ of openQuestions) {
          await api.addOpenQuestion(createdTest.id, {
            text: openQ.text,
            correctAnswer: openQ.correctAnswer,
            points: openQ.points
          });
        }
      }

      Alert.alert(translations.success, translations.testCreated, [
        { text: translations.ok, onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Test yaratma xətası:', error);
      Alert.alert(translations.error, translations.failedToCreate);
    }
  };

  const renderClosedQuestion = (question: ClosedQuestion, qIndex: number) => (
    <ThemedView key={qIndex} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
      <ThemedView style={styles.questionHeader}>
        <ThemedText style={styles.questionNumber}>{translations.question} {qIndex + 1} (Bağlı)</ThemedText>
      </ThemedView>
      
      <ThemedTextInput
        style={styles.input}
        placeholder={translations.questionText}
        value={question.text}
        onChangeText={(text) => updateClosedQuestion(qIndex, 'text', text)}
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
              {option.isCorrect ? translations.correct : translations.markAsCorrect}
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
  );

  const renderOpenQuestion = (question: OpenQuestion, qIndex: number) => (
    <ThemedView key={qIndex} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
      <ThemedView style={styles.questionHeader}>
        <ThemedText style={styles.questionNumber}>{translations.question} {qIndex + 1} (Açıq)</ThemedText>
      </ThemedView>
      
      <ThemedTextInput
        style={styles.input}
        placeholder={translations.questionText}
        value={question.text}
        onChangeText={(text) => updateOpenQuestion(qIndex, 'text', text)}
      />

      <ThemedTextInput
        style={styles.input}
        placeholder="Düzgün cavab"
        value={question.correctAnswer}
        onChangeText={(text) => updateOpenQuestion(qIndex, 'correctAnswer', text)}
      />

      <ThemedView style={styles.pointsContainer}>
        <ThemedText style={styles.pointsLabel}>Suala görə xallar:</ThemedText>
        <ThemedTextInput
          style={styles.pointsInput}
          placeholder="1"
          value={question.points.toString()}
          onChangeText={(text) => updateOpenQuestion(qIndex, 'points', parseInt(text) || 1)}
          keyboardType="numeric"
        />
      </ThemedView>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeQuestion(qIndex)}
      >
        <ThemedText style={styles.removeButtonText}>{translations.removeQuestion}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

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

          {questions.map((question, qIndex) => {
            if (question.type === 'closed') {
              return renderClosedQuestion(question as ClosedQuestion, qIndex);
            } else {
              return renderOpenQuestion(question as OpenQuestion, qIndex);
            }
          })}

          <ThemedView style={styles.addQuestionButtonsContainer}>
            <TouchableOpacity
              style={[styles.addQuestionButton, { backgroundColor: cardBackgroundColor, marginRight: 8 }]}
              onPress={addClosedQuestion}
            >
              <ThemedText style={[styles.addQuestionText, { color: tintColor }]}>
                + Bağlı sual
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addQuestionButton, { backgroundColor: cardBackgroundColor, marginLeft: 8 }]}
              onPress={addOpenQuestion}
            >
              <ThemedText style={[styles.addQuestionText, { color: tintColor }]}>
                + Açıq sual
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
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
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
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
  addQuestionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addQuestionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  addQuestionText: {
    fontSize: 16,
    fontWeight: '600',
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
    marginTop: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsLabel: {
    fontSize: 16,
    marginRight: 12,
  },
  pointsInput: {
    width: 80,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});