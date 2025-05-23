import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockVideoCourses } from '../../constants/mockData';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface VideoCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
}

export default function VideosScreen() {
  const [courses, setCourses] = useState<VideoCourse[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    loadCourses();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.isAdmin);
    }
  };

  const loadCourses = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCourses(mockVideoCourses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load video courses');
    }
  };

  const handleCoursePress = (course: VideoCourse) => {
    router.push(`/video-course/${course.id}`);
  };

  const renderCourseItem = ({ item }: { item: VideoCourse }) => (
    <TouchableOpacity
      style={[styles.courseItem, { backgroundColor: cardBackgroundColor }]}
      onPress={() => handleCoursePress(item)}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.thumbnail}
      />
      <ThemedView style={styles.courseInfo}>
        <ThemedText type="defaultSemiBold" style={styles.courseTitle}>{item.title}</ThemedText>
        <ThemedText type="default" style={styles.courseDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <ThemedText style={[styles.duration, { color: tintColor }]}>{item.duration}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      {isAdmin && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: tintColor }]}
          onPress={() => router.push('/video-course/create')}
        >
          <ThemedText style={[styles.addButtonText, { color: backgroundColor }]}>Add New Course</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  courseItem: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  courseDescription: {
    opacity: 0.8,
    marginBottom: 8,
  },
  duration: {
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
}); 