import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { api } from '@/services/api';

type ClosedQuestion = {
  type: 'closed';
  id?: string;
  text: string;
  options: Array<{
    id?: string;
    text: string;
    isCorrect: boolean;
  }>;
};

type OpenQuestion = {
  type: 'open';
  id?: string;
  text: string;
  correctAnswer: string;
  points: number;
};

type Question = ClosedQuestion | OpenQuestion;

export default function UpdateTestScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | Date>('');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const initialOpenIdsRef = useRef<string[]>([]);
  const [removedOpenIds, setRemovedOpenIds] = useState<string[]>([]);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getTest(id as string);
        setTitle(data?.test?.title || '');
        setDescription(data?.test?.description || '');
        setIsPremium(Boolean(data?.test?.isPremium));
        setCreatedAt(data?.test?.createdAt || new Date().toISOString());
        setIsActive(data?.test?.isActive ?? true);

        const closedQs: Question[] = (data?.test?.questions || []).map((q: any) => ({
          type: 'closed',
          id: q.id,
          text: q.text,
          options: (q.options || [])
            .sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
            .map((o: any) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect }))
        }));

        const openQs: Question[] = (data?.openQuestions || []).map((q: any) => ({
          type: 'open',
          id: q.id,
          text: q.text,
          correctAnswer: q.correctAnswer,
          points: q.points ?? 1
        }));

        setQuestions([...closedQs, ...openQs]);
        initialOpenIdsRef.current = openQs.map((q: any) => q.id).filter(Boolean) as string[];
        setRemovedOpenIds([]);
      } catch (e) {
        console.error('Failed to load test for update:', e);
        Alert.alert(translations.error, translations.failedToLoadTests);
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const addClosedQuestion = () => {
    setQuestions(prev => ([
      ...prev,
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
    ]));
  };

  const addOpenQuestion = () => {
    setQuestions(prev => ([
      ...prev,
      { type: 'open', text: '', correctAnswer: '', points: 1 }
    ]));
  };

  const updateClosedQuestion = (index: number, field: keyof ClosedQuestion, value: any) => {
    const newQuestions = [...questions];
    if (newQuestions[index].type === 'closed') {
      if (field === 'text') {
        (newQuestions[index] as ClosedQuestion).text = value;
      }
      setQuestions(newQuestions);
    }
  };

  const updateOpenQuestion = (index: number, field: keyof OpenQuestion, value: any) => {
    const newQuestions = [...questions];
    if (newQuestions[index].type === 'open') {
      const openQ = newQuestions[index] as OpenQuestion;
      if (field === 'text') openQ.text = value;
      if (field === 'correctAnswer') openQ.correctAnswer = value;
      if (field === 'points') openQ.points = value;
      setQuestions(newQuestions);
    }
  };

  const updateOption = (qIndex: number, oIndex: number, field: 'text' | 'isCorrect', value: any) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].type === 'closed') {
      const closed = newQuestions[qIndex] as ClosedQuestion;
      if (field === 'text') {
        closed.options[oIndex].text = value;
      } else if (field === 'isCorrect') {
        closed.options.forEach(opt => opt.isCorrect = false);
        closed.options[oIndex].isCorrect = value;
      }
      setQuestions(newQuestions);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => {
      const q = prev[index];
      if (q.type === 'open' && q.id) {
        setRemovedOpenIds(ids => [...ids, q.id as string]);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim()) {
        Alert.alert(translations.error, translations.pleaseEnter + ' ' + translations.testTitle);
        return;
      }
      if (!description.trim()) {
        Alert.alert(translations.error, translations.pleaseEnter + ' ' + translations.testDescription);
        return;
      }

      const invalidClosed = questions.some(q => q.type === 'closed' && (!q.text.trim() || (q as ClosedQuestion).options.some(o => !o.text.trim()) || !(q as ClosedQuestion).options.some(o => o.isCorrect)));
      const invalidOpen = questions.some(q => q.type === 'open' && (!q.text.trim() || !(q as OpenQuestion).correctAnswer.trim() || (q as OpenQuestion).points <= 0));
      if (invalidClosed) {
        Alert.alert(translations.error, translations.pleaseFillQuestionsCorrectly);
        return;
      }
      if (invalidOpen) {
        Alert.alert(translations.error, 'Zəhmət olmasa bütün açıq sualları düzgün cavab və xallarla doldurun');
        return;
      }

      const closedQuestions = questions.filter(q => q.type === 'closed') as ClosedQuestion[];
      const openQuestions = questions.filter(q => q.type === 'open') as OpenQuestion[];

      // 1) Update Test with CLOSED questions (server handles nested graph)
      await api.updateTest(id as string, {
        title,
        description,
        isPremium,
        questions: closedQuestions.map((q) => ({
          text: q.text,
          points: 1,
          options: q.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          }))
        }))
      });

      // 2) Open questions CRUD
      // Deleted
      for (const removedId of removedOpenIds) {
        await api.deleteOpenQuestion(id as string, removedId);
      }
      // Updated or created
      for (const oq of openQuestions) {
        if (oq.id) {
          await api.updateOpenQuestion(id as string, oq.id, {
            text: oq.text,
            correctAnswer: oq.correctAnswer,
            points: oq.points
          });
        } else {
          await api.addOpenQuestion(id as string, {
            text: oq.text,
            correctAnswer: oq.correctAnswer,
            points: oq.points
          });
        }
      }

      Alert.alert(translations.success, 'Test yeniləndi', [
        { text: translations.ok, onPress: () => router.push(`/test/${id}`) }
      ]);
    } catch (error) {
      console.error('Update test error:', error);
      Alert.alert(translations.error, 'Test yenilənmədi');
    }
  };

  const renderClosedQuestion = (question: ClosedQuestion, qIndex: number) => (
    <ThemedView key={`closed-${qIndex}-${question.id || 'new'}`} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
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
        <ThemedView key={`opt-${question.id || 'new'}-${oIndex}`} style={[styles.optionContainer, { backgroundColor: cardBackgroundColor }]}>
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
    <ThemedView key={`open-${qIndex}-${question.id || 'new'}`} style={[styles.questionCard, { backgroundColor: cardBackgroundColor }]}>
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

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>{translations.loading}</ThemedText>
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

          {questions.map((q, qIndex) => q.type === 'closed' ? (
            renderClosedQuestion(q as ClosedQuestion, qIndex)
          ) : (
            renderOpenQuestion(q as OpenQuestion, qIndex)
          ))}

          <ThemedView style={styles.addQuestionButtonsContainer}>
            <TouchableOpacity
              style={[styles.addQuestionButton, { backgroundColor: cardBackgroundColor, marginRight: 8 }]}
              onPress={addClosedQuestion}
            >
              <ThemedText style={[styles.addQuestionText, { color: tintColor }]}>+ Bağlı sual</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addQuestionButton, { backgroundColor: cardBackgroundColor, marginLeft: 8 }]}
              onPress={addOpenQuestion}
            >
              <ThemedText style={[styles.addQuestionText, { color: tintColor }]}>+ Açıq sual</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmit}
        >
          <ThemedText style={[styles.submitButtonText, { color: backgroundColor }]}>Redaktəni yadda saxla</ThemedText>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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


