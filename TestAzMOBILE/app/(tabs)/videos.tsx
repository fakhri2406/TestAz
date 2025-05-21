import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockVideoCourses } from '../../constants/mockData';

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
      style={styles.courseItem}
      onPress={() => handleCoursePress(item)}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.thumbnail}
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.duration}>{item.duration}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      {isAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/video-course/create')}
        >
          <Text style={styles.addButtonText}>Add New Course</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  courseItem: {
    backgroundColor: 'white',
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
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDescription: {
    color: '#666',
    marginBottom: 8,
  },
  duration: {
    color: '#007AFF',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 