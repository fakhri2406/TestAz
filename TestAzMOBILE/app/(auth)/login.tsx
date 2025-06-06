import React, { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { translations } from '@/constants/translations';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(translations.error, translations.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with email:', email);
      const result = await login(email, password);
      console.log('Login result:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('Login successful, current user:', JSON.stringify(user, null, 2));
        console.log('User role:', user?.role);
        router.replace('/(tabs)');
      } else {
        console.log('Login failed:', result.message);
        // Show notification for login failure
        if (Platform.OS === 'android') {
          ToastAndroid.show(result.message || translations.loginFailed, ToastAndroid.LONG);
        } else {
          Alert.alert(
            translations.error,
            result.message || translations.loginFailed,
            [{ text: 'OK' }],
            { cancelable: true }
          );
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : translations.loginFailed;
      if (Platform.OS === 'android') {
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
      } else {
        Alert.alert(translations.error, errorMessage);
      }
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
        <ThemedText type="title" style={styles.title}>{translations.welcomeBack}</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>{translations.signInToContinue}</ThemedText>

        <ThemedView style={styles.inputContainer}>
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
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { 
                borderColor,
                color: textColor,
                backgroundColor: backgroundColor
              }]}
              placeholder={translations.password}
              placeholderTextColor={borderColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={borderColor}
              />
            </TouchableOpacity>
          </View>
        </ThemedView>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={backgroundColor} />
          ) : (
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>{translations.signIn}</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupLink}
          onPress={() => router.push('/signup')}
          disabled={loading}
        >
          <ThemedText style={styles.signupText}>
            {translations.dontHaveAccount} <ThemedText style={[styles.signupTextBold, { color: tintColor }]}>{translations.signUp}</ThemedText>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50, // Make room for the eye icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 13,
    padding: 4,
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
  signupLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
  },
  signupTextBold: {
    fontWeight: '600',
  },
}); 