import React from 'react';
import { StyleSheet, TouchableOpacity, Linking, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

export default function InfoScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const [imageError, setImageError] = React.useState(false);

  const professorData = {
    name: 'Fərid Qurbanov',
    department: 'Huquq Elmləri',
    university: 'Bakı Dövlət Universiteti',
    phone: '+994 51 355 51 83',
    email: 'ali.mammadov@bdu.edu.az',
    office: 'Bina 2, Otaq 305',
    officeHours: 'Bazar ertəsi - Cümə: 10:00-12:00',
    // Local asset (recommended for production)
    photo: require('@/assets/images/professor-photo.jpeg'),
    // Network URL (alternative)
    // photo: 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=Dr.+Əli+Məmmədov',
  };

  const handleCall = () => {
    Linking.openURL(`tel:${professorData.phone}`).catch(() => {
      Alert.alert(translations.error, 'Telefon nömrəsi açıla bilmədi');
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${professorData.email}`).catch(() => {
      Alert.alert(translations.error, 'E-poçt açıla bilmədi');
    });
  };

  const handleImageError = () => {
    // Fallback to placeholder if image fails to load
    console.log('Professor image failed to load');
    setImageError(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            {translations.professorInfo}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.content}>
          {/* Professor Photo and Basic Info */}
          <ThemedView style={[styles.professorCard, { backgroundColor: cardBackgroundColor }]}>
            <ThemedView style={styles.photoContainer}>
              {!imageError ? (
                <Image 
                  source={typeof professorData.photo === 'string' ? { uri: professorData.photo } : professorData.photo}
                  style={styles.professorPhoto}
                  resizeMode="cover"
                  onError={handleImageError}
                />
              ) : (
                <ThemedView style={[styles.professorPhoto, { borderColor: borderColor, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(74, 144, 226, 0.1)' }]}>
                  <Ionicons name="person" size={60} color={tintColor} />
                </ThemedView>
              )}
            </ThemedView>
            
            <ThemedView style={styles.professorInfo}>
              <ThemedText type="title" style={styles.professorName}>
                {professorData.name}
              </ThemedText>
              <ThemedText style={styles.professorTitle}>
                {professorData.title}
              </ThemedText>
              <ThemedText style={styles.professorDepartment}>
                {professorData.department}
              </ThemedText>
              <ThemedText style={styles.professorUniversity}>
                {professorData.university}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Contact Information */}
          <ThemedView style={[styles.contactCard, { backgroundColor: cardBackgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {translations.contactProfessor}
            </ThemedText>

            {/* Phone Number */}
            <TouchableOpacity 
              style={[styles.contactItem, { borderBottomColor: borderColor }]}
              onPress={handleCall}
            >
              <ThemedView style={styles.contactIcon}>
                <Ionicons name="call" size={24} color={tintColor} />
              </ThemedView>
              <ThemedView style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>
                  {translations.professorNumber}
                </ThemedText>
                <ThemedText style={styles.contactValue}>
                  {professorData.phone}
                </ThemedText>
              </ThemedView>
              <Ionicons name="chevron-forward" size={20} color={borderColor} />
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity 
              style={[styles.contactItem, { borderBottomColor: borderColor }]}
              onPress={handleEmail}
            >
              <ThemedView style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color={tintColor} />
              </ThemedView>
              <ThemedView style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>
                  E-poçt
                </ThemedText>
                <ThemedText style={styles.contactValue}>
                  {professorData.email}
                </ThemedText>
              </ThemedView>
              <Ionicons name="chevron-forward" size={20} color={borderColor} />
            </TouchableOpacity>

            {/* Office */}
            <ThemedView style={[styles.contactItem, { borderBottomColor: borderColor }]}>
              <ThemedView style={styles.contactIcon}>
                <Ionicons name="location" size={24} color={tintColor} />
              </ThemedView>
              <ThemedView style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>
                  Ofis
                </ThemedText>
                <ThemedText style={styles.contactValue}>
                  {professorData.office}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Office Hours */}
            <ThemedView style={styles.contactItem}>
              <ThemedView style={styles.contactIcon}>
                <Ionicons name="time" size={24} color={tintColor} />
              </ThemedView>
              <ThemedView style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>
                  Qəbul Saatları
                </ThemedText>
                <ThemedText style={styles.contactValue}>
                  {professorData.officeHours}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  professorCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  photoContainer: {
    marginBottom: 16,
  },
  professorPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  professorInfo: {
    alignItems: 'center',
  },
  professorName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  professorTitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  professorDepartment: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
    textAlign: 'center',
  },
  professorUniversity: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  contactCard: {
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  contactIcon: {
    width: 40,
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 