import React from 'react';
import { StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { router } from 'expo-router';

export default function ParametersScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const cardBackgroundColor = useThemeColor({}, 'card');

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[styles.returnButton, { backgroundColor: cardBackgroundColor }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={tintColor} />
        <ThemedText style={[styles.returnButtonText, { color: tintColor }]}>
          {translations.backToProfile}
        </ThemedText>
      </TouchableOpacity>

      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.sectionTitle}>
          {translations.settings}
        </ThemedText>

        <ThemedView style={[styles.menuItem, { borderBottomColor: borderColor }]}>
          <Ionicons name="notifications-outline" size={24} color={tintColor} />
          <ThemedText style={styles.menuText}>
            {translations.notifications}
          </ThemedText>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#767577', true: tintColor }}
          />
        </ThemedView>

        <ThemedView style={[styles.menuItem, { borderBottomColor: borderColor }]}>
          <Ionicons name="language-outline" size={24} color={tintColor} />
          <ThemedText style={styles.menuText}>
            {translations.language}
          </ThemedText>
          <ThemedText style={styles.menuValue}>Azərbaycan</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.menuItem, { borderBottomColor: borderColor }]}>
          <Ionicons name="moon-outline" size={24} color={tintColor} />
          <ThemedText style={styles.menuText}>
            {translations.darkMode}
          </ThemedText>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: '#767577', true: tintColor }}
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title" style={styles.sectionTitle}>
          {translations.account}
        </ThemedText>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]}>
          <Ionicons name="lock-closed-outline" size={24} color={tintColor} />
          <ThemedText style={styles.menuText}>
            {translations.changePassword}
          </ThemedText>
          <Ionicons name="chevron-forward" size={24} color={borderColor} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]}>
          <Ionicons name="mail-outline" size={24} color={tintColor} />
          <ThemedText style={styles.menuText}>
            {translations.changeEmail}
          </ThemedText>
          <Ionicons name="chevron-forward" size={24} color={borderColor} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  menuValue: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 