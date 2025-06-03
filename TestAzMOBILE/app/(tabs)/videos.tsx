import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

interface VideoCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPremium: boolean;
  videoUrl: string;
}

export default function VideosScreen() {
  const [videos, setVideos] = useState<VideoCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  useEffect(() => {
    loadVideos();
    checkUserStatus();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const videosData = await api.getVideoCourses();
      const formattedVideos = Array.isArray(videosData) 
        ? videosData.map(video => ({
            id: video.id || '',
            title: video.title || '',
            description: video.description || '',
            duration: video.duration || '0:00',
            isPremium: video.isPremium || false,
            videoUrl: video.videoUrl || ''
          }))
        : [];
      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const checkUserStatus = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser?.id) {
        const userData = await api.getUserById(currentUser.id);
        const isUserAdmin = userData.role === 'Admin';
        setIsAdmin(isUserAdmin);
        setIsPremium(userData.isPremium || false);
        
        // Redirect to home if not admin
        if (!isUserAdmin) {
          router.replace('/');
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setIsAdmin(false);
      setIsPremium(false);
      router.replace('/');
    }
  };

  const handleVideoPress = (video: VideoCourse) => {
    if (video.isPremium && !isPremium) {
      Alert.alert(
        'Premium Video',
        'This is a premium video course. Please upgrade your account to access premium content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Upgrade to Premium', 
            onPress: () => router.push('/premium')
          }
        ]
      );
      return;
    }
    router.push({
      pathname: '/video/[id]',
      params: { id: video.id }
    });
  };

  const handleAddVideo = () => {
    router.push('/video/new');
  };

  const handleDeleteVideo = async (videoId: string) => {
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
              await api.deleteVideoCourse(videoId);
              setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
              Alert.alert('Success', 'Video course deleted successfully');
            } catch (error) {
              console.error('Error deleting video course:', error);
              Alert.alert('Error', 'Failed to delete video course. Please try again.');
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

  return (
    <ThemedView style={styles.container}>
      {videos.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No video courses available</ThemedText>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={handleAddVideo}
            >
              <Ionicons name="add" size={24} color={backgroundColor} />
              <ThemedText style={[styles.addButtonText, { color: backgroundColor }]}>
                Add New Video Course
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      ) : (
        <>
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.videoItem, 
                  { 
                    backgroundColor: cardBackgroundColor,
                    opacity: item.isPremium && !isPremium ? 0.7 : 1,
                    borderWidth: item.isPremium ? 2 : 0,
                    borderColor: tintColor
                  }
                ]}
                onPress={() => handleVideoPress(item)}
              >
                <ThemedView style={styles.videoHeader}>
                  <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title" style={styles.videoTitle}>{item.title}</ThemedText>
                    {item.isPremium && (
                      <ThemedView style={[styles.premiumBadge, { backgroundColor: tintColor }]}>
                        {!isPremium ? (
                          <Ionicons name="lock-closed" size={16} color="#fff" />
                        ) : (
                          <Ionicons name="star" size={16} color="#fff" />
                        )}
                        <ThemedText style={styles.premiumText}>
                          {!isPremium ? 'Locked' : 'Premium'}
                        </ThemedText>
                      </ThemedView>
                    )}
                  </ThemedView>
                  <ThemedView style={styles.headerRight}>
                    <ThemedText type="subtitle" style={styles.videoDuration}>
                      {translations.duration}: {item.duration}
                    </ThemedText>
                    {isAdmin && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteVideo(item.id)}
                      >
                        <Ionicons name="trash-outline" size={24} color="#ff3b30" />
                      </TouchableOpacity>
                    )}
                  </ThemedView>
                </ThemedView>
                <ThemedText style={styles.videoDescription}>{item.description}</ThemedText>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[tintColor]}
                tintColor={tintColor}
              />
            }
          />
          
          {isAdmin && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={handleAddVideo}
            >
              <Ionicons name="add" size={24} color={backgroundColor} />
              <ThemedText style={[styles.addButtonText, { color: backgroundColor }]}>
                Add New Video Course
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.reloadButton, { backgroundColor: cardBackgroundColor }]}
            onPress={onRefresh}
          >
            <Ionicons name="refresh" size={24} color={tintColor} />
          </TouchableOpacity>
        </>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
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
    padding: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reloadButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    padding: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
}); 