import React, { useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const handleSignup = async () => {
    if (!name || !surname || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.signup({ email, password, name, surname });
      await api.login({ email, password });
      router.replace('/(tabs)/tests');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Signup failed');
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
        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>Sign up to get started</ThemedText>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder="Name"
            placeholderTextColor={borderColor}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder="Surname"
            placeholderTextColor={borderColor}
            value={surname}
            onChangeText={setSurname}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder="Email"
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
            placeholder="Password"
            placeholderTextColor={borderColor}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          <TextInput
            style={[styles.input, { 
              borderColor,
              color: textColor,
              backgroundColor: backgroundColor
            }]}
            placeholder="Confirm Password"
            placeholderTextColor={borderColor}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>Create Account</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/login')}
          disabled={loading}
        >
          <ThemedText style={styles.loginText}>
            Already have an account? <ThemedText style={[styles.loginTextBold, { color: tintColor }]}>Sign in</ThemedText>
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
}); 