import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MainMenu() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TestAz</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/create-test')}
      >
        <Text style={styles.buttonText}>Create Test</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => {/* TODO: Add view tests functionality */}}
      >
        <Text style={styles.buttonText}>View Tests</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => {/* TODO: Add video courses functionality */}}
      >
        <Text style={styles.buttonText}>Video Courses</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
}); 