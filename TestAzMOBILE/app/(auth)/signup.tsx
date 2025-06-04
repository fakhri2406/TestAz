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
import { router } from 'expo-router';
import { api } from '../../services/api';
import { useAuth } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleSignup = async () => {
    if (!name || !surname || !email || !password) {
      Alert.alert(translations.error, translations.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      await api.signup({ name, surname, email, password });
      router.push({
        pathname: '/verify-code',
        params: { email }
      });
    } catch (error) {
      Alert.alert(translations.error, error instanceof Error ? error.message : translations.signupFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      await api.resendVerification(email);
      Alert.alert(translations.success, translations.verificationEmailResent);
    } catch (error) {
      Alert.alert(translations.error, error instanceof Error ? error.message : translations.resendVerificationFailed);
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
        <ThemedText type="title" style={styles.title}>{translations.createAccount}</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>{translations.signInToContinue}</ThemedText>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder={translations.name}
            placeholderTextColor={borderColor}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder={translations.surname}
            placeholderTextColor={borderColor}
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="words"
            editable={!loading}
          />
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder={translations.email}
            placeholderTextColor={borderColor}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder={translations.password}
            placeholderTextColor={borderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </ThemedView>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={backgroundColor} />
          ) : (
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>{translations.createAccount}</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/login')}
          disabled={loading}
        >
          <ThemedText style={styles.loginText}>
            {translations.alreadyHaveAccount} <ThemedText style={[styles.loginTextBold, { color: tintColor }]}>{translations.signIn}</ThemedText>
          </ThemedText>
        </TouchableOpacity>
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
    gap: 16,
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
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
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
  },
  loginTextBold: {
    fontWeight: '600',
  },
  verificationActions: {
    gap: 16,
  },
}); 