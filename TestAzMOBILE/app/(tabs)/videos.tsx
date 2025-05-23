import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

export default function VideosScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    loadVideos();
    checkAdminStatus();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await api.getVideos();
      setVideos(response.data);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const user = await api.getCurrentUser();
      setIsAdmin(user.data.isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleVideoPress = (video) => {
    router.push({
      pathname: '/video/[id]',
      params: { id: video.id }
    });
  };

  const handleAddVideo = () => {
    router.push('/video/new');
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.videoItem, { backgroundColor: cardBackgroundColor }]}
            onPress={() => handleVideoPress(item)}
          >
            <ThemedView style={styles.videoHeader}>
              <ThemedText type="title" style={styles.videoTitle}>{item.title}</ThemedText>
              <ThemedText type="subtitle" style={styles.videoDuration}>
                {translations.duration}: {item.duration}
              </ThemedText>
            </ThemedView>
            <ThemedText style={styles.videoDescription}>{item.description}</ThemedText>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
      {isAdmin && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: tintColor }]}
          onPress={handleAddVideo}
        >
          <ThemedText style={[styles.addButtonText, { color: backgroundColor }]}>
            {translations.addNewVideo}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
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
  list: {
    padding: 16,
  },
  videoItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  videoDuration: {
    fontSize: 16,
  },
  videoDescription: {
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 