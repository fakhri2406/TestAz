import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface VideoCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPremium: boolean;
  videoUrl: string;
}

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState<VideoCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    loadVideo();
    checkAdminStatus();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const videoData = await api.getVideoCourse(id as string);
      setVideo(videoData);
    } catch (error) {
      console.error('Error loading video:', error);
      Alert.alert('Error', 'Failed to load video course');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser?.id) {
        const userData = await api.getUserById(currentUser.id);
        setIsAdmin(userData.role === 'Admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Video Course',
      'Are you sure you want to delete this video course?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.deleteVideoCourse(id as string);
              Alert.alert('Success', 'Video course deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting video course:', error);
              Alert.alert('Error', 'Failed to delete video course');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (!video) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Video course not found</ThemedText>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: tintColor }]}
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.backButtonText, { color: backgroundColor }]}>
            Go Back
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.videoContainer}>
        <Video
          style={styles.video}
          source={{ uri: video.videoUrl }}
          useNativeControls
          resizeMode="contain"
          isLooping={false}
        />
      </ThemedView>

      <ThemedView style={[styles.contentContainer, { backgroundColor: cardBackgroundColor }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>{video.title}</ThemedText>
          {video.isPremium && (
            <ThemedView style={[styles.premiumBadge, { backgroundColor: tintColor }]}>
              <Ionicons name="star" size={16} color="#fff" />
              <ThemedText style={styles.premiumText}>Premium</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.details}>
          <ThemedText style={styles.duration}>
            Duration: {video.duration}
          </ThemedText>
        </ThemedView>

        <ThemedText style={styles.description}>{video.description}</ThemedText>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: '#ff3b30' }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <ThemedText style={[styles.deleteButtonText, { color: '#fff' }]}>
              Delete Video Course
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  premiumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  details: {
    marginBottom: 16,
  },
  duration: {
    fontSize: 16,
    opacity: 0.7,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 