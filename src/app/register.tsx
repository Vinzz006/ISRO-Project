import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, Link } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please provide an operator email and password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Security passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.titleLine1}>REGISTER FLIGHT TERMINAL</Text>
          <Text style={styles.subtitle}>MISSION CONTROL ACCESS ENROLLMENT</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>OPERATOR CREDENTIALS</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>OPERATOR EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="controller@launch-vehicle.net"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CHOSEN PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={Colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={submitting || isLoading}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.buttonPrimaryText} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>REGISTER & LAUNCH</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already registered? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Operator Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleLine1: {
    color: Colors.cyan,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
  },
  cardHeader: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 42, 85, 0.15)',
    borderColor: Colors.critical,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: Colors.critical,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    color: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  primaryBtn: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: Colors.buttonPrimaryText,
    fontWeight: '900',
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginPrompt: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  loginLink: {
    color: Colors.cyan,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
