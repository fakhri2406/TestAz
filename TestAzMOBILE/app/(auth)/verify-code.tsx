import React, { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

export default function VerifyCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert(translations.error, translations.fillAllFields);
      return;
    }

    if (code.length !== 4) {
      Alert.alert(translations.error, 'Please enter a 4-digit verification code');
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying code for email:', email);
      console.log('Code:', code);
      
      await api.verifyCode({ email, code });
      console.log('Verification successful');
      
      Alert.alert(
        translations.success,
        translations.emailVerified,
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error) {
      console.error('Verification error:', error);
      let errorMessage = translations.verificationFailed;
      
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          errorMessage = 'Verification code has expired. Please request a new one.';
        } else if (error.message.includes('Invalid')) {
          errorMessage = 'Invalid verification code. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(translations.error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      console.log('Resending verification code for email:', email);
      
      await api.resendVerification({ email });
      console.log('Verification code resent successfully');
      
      Alert.alert(translations.success, translations.verificationEmailResent);
    } catch (error) {
      console.error('Resend verification error:', error);
      Alert.alert(
        translations.error,
        error instanceof Error ? error.message : translations.resendVerificationFailed
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor }]}
    >
      <ThemedView style={styles.formContainer}>
        <ThemedText type="title" style={styles.title}>{translations.enterVerificationCode}</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          {translations.verificationCodeSentTo.replace('{email}', email)}
        </ThemedText>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder={translations.verificationCode}
            placeholderTextColor={borderColor}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={4}
            editable={!loading}
          />
        </ThemedView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: tintColor }, loading && styles.buttonDisabled]}
            onPress={handleVerifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={backgroundColor} />
            ) : (
              <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>
                {translations.verifyCode}
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resendButton, { borderColor: tintColor }]}
            onPress={handleResendCode}
            disabled={loading}
          >
            <ThemedText style={[styles.resendButtonText, { color: tintColor }]}>
              {translations.resendCode}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 