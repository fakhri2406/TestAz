import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

export default function NewVideoScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!title.trim()) {
        Alert.alert('Error', 'Please enter a video title');
        return;
      }

      if (!description.trim()) {
        Alert.alert('Error', 'Please enter a video description');
        return;
      }

      if (!duration.trim()) {
        Alert.alert('Error', 'Please enter video duration');
        return;
      }

      if (!videoUrl.trim()) {
        Alert.alert('Error', 'Please enter video URL');
        return;
      }

      setLoading(true);
      const videoData = {
        title,
        description,
        duration,
        videoUrl,
        isPremium
      };

      await api.createVideoCourse(videoData);
      Alert.alert('Success', 'Video course created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating video course:', error);
      Alert.alert('Error', 'Failed to create video course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={[styles.formContainer, { backgroundColor: cardBackgroundColor }]}>
        <ThemedText type="title" style={styles.title}>Create New Video Course</ThemedText>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder="Enter video title"
            placeholderTextColor={borderColor}
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder="Enter video description"
            placeholderTextColor={borderColor}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Duration (e.g., 10:30)</ThemedText>
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder="Enter video duration"
            placeholderTextColor={borderColor}
            value={duration}
            onChangeText={setDuration}
            editable={!loading}
          />
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Video URL</ThemedText>
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder="Enter video URL"
            placeholderTextColor={borderColor}
            value={videoUrl}
            onChangeText={setVideoUrl}
            editable={!loading}
          />
        </ThemedView>

        <TouchableOpacity
          style={[styles.premiumToggle, { 
            backgroundColor: isPremium ? tintColor : backgroundColor,
            borderColor
          }]}
          onPress={() => setIsPremium(!isPremium)}
          disabled={loading}
        >
          <Ionicons 
            name={isPremium ? "star" : "star-outline"} 
            size={24} 
            color={isPremium ? "#fff" : borderColor} 
          />
          <ThemedText style={[
            styles.premiumText,
            { color: isPremium ? "#fff" : textColor }
          ]}>
            Premium Video Course
          </ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, { backgroundColor: tintColor }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={backgroundColor} />
            ) : (
              <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
                Create Video Course
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor }]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonText, { color: textColor }]}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  premiumToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginBottom: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 