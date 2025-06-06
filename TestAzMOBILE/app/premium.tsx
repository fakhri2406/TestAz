import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api } from '@/services/api';

export default function PremiumScreen() {
  const [loading, setLoading] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      await api.requestPremiumUpgrade();
      Alert.alert(
        'Request Sent',
        'Your premium upgrade request has been sent to the administrator. You will be notified once it is reviewed.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error requesting premium upgrade:', error);
      Alert.alert('Error', 'Failed to send upgrade request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={[styles.returnButton, { backgroundColor: cardBackgroundColor }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
          <ThemedText style={[styles.returnButtonText, { color: tintColor }]}>
            Back
          </ThemedText>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView}>
          <ThemedView style={[styles.header, { backgroundColor: cardBackgroundColor }]}>
            <Ionicons name="star" size={48} color={tintColor} />
            <ThemedText style={styles.title}>Upgrade to Premium</ThemedText>
            <ThemedText style={styles.subtitle}>Get access to premium tests</ThemedText>
          </ThemedView>

          <ThemedView style={[styles.featuresCard, { backgroundColor: cardBackgroundColor }]}>
            <ThemedText style={styles.featuresTitle}>Premium Features</ThemedText>
            
            <ThemedView style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={tintColor} />
              <ThemedText style={styles.featureText}>Access to all premium tests</ThemedText>
            </ThemedView>

            <ThemedView style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={tintColor} />
              <ThemedText style={styles.featureText}>Detailed test analytics</ThemedText>
            </ThemedView>

            <ThemedView style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={tintColor} />
              <ThemedText style={styles.featureText}>Priority support</ThemedText>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: tintColor }]}
            onPress={handleUpgrade}
            disabled={loading}
          >
            <ThemedText style={[styles.upgradeButtonText, { color: backgroundColor }]}>
              {loading ? 'Sending Request...' : 'Request Premium Upgrade'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
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
  header: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  featuresCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  upgradeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 