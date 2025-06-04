import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { Collapsible } from '@/components/Collapsible';
import { router } from 'expo-router';

export default function HelpScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const cardBackgroundColor = useThemeColor({}, 'card');

  const faqs = [
    {
      question: 'Testləri necə həll edə bilərəm?',
      answer: 'Testlər bölməsinə daxil olun və istədiyiniz testi seçin. Hər bir sual üçün bir cavab seçin və testi tamamladıqdan sonra nəticələrinizi görə bilərsiniz.'
    },
    {
      question: 'Video kursları necə izləyə bilərəm?',
      answer: 'Video kurslar bölməsinə daxil olun və istədiyiniz kursu seçin. Kursun məzmununu izləyə və öyrənə bilərsiniz.'
    },
    {
      question: 'Şifrəmi unutdum, nə etməliyəm?',
      answer: 'Giriş səhifəsində "Şifrəni unutdum" düyməsini klikləyin və e-poçt ünvanınızı daxil edin. Şifrə bərpası üçün təlimatlar e-poçt ünvanınıza göndəriləcək.'
    }
  ];

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

      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            {translations.frequentlyAskedQuestions}
          </ThemedText>

          {faqs.map((faq, index) => (
            <Collapsible key={index} title={faq.question}>
              <ThemedText style={styles.answer}>{faq.answer}</ThemedText>
            </Collapsible>
          ))}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            {translations.contactSupport}
          </ThemedText>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]}>
            <Ionicons name="mail-outline" size={24} color={tintColor} />
            <ThemedText style={styles.menuText}>
              {translations.emailSupport}
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color={borderColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]}>
            <Ionicons name="chatbubble-outline" size={24} color={tintColor} />
            <ThemedText style={styles.menuText}>
              {translations.liveChat}
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color={borderColor} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: borderColor }]}>
            <Ionicons name="call-outline" size={24} color={tintColor} />
            <ThemedText style={styles.menuText}>
              {translations.phoneSupport}
            </ThemedText>
            <Ionicons name="chevron-forward" size={24} color={borderColor} />
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
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
  scrollView: {
    flex: 1,
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
  answer: {
    fontSize: 16,
    lineHeight: 24,
    padding: 15,
  },
}); 