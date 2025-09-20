import React, { useEffect, useState } from 'react';
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

export default function UpdateTestScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | Date>('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

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

      await api.updateTest(id as string, {
        id: id as string,
        title,
        description,
        isPremium,
        createdAt: createdAt || new Date().toISOString(),
        isActive,
      });

      Alert.alert(translations.success, 'Test yeniləndi', [
        { text: translations.ok, onPress: () => router.push(`/test/${id}`) }
      ]);
    } catch (error) {
      console.error('Update test error:', error);
      Alert.alert(translations.error, 'Test yenilənmədi');
    }
  };

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
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tintColor }]}
          onPress={handleSubmit}
        >
          <ThemedText style={[styles.submitButtonText, { color: backgroundColor }]}>
            Redaktəni yadda saxla
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


