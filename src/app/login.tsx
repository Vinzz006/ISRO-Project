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
import { APP_CONFIG } from '../constants/config';

export default function LoginScreen() {
  const { login, loginAsDemoOperator, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please provide operator email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAccess = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginAsDemoOperator();
      router.replace('/(tabs)/dashboard');
    } catch {
      setError('Could not initialize demo operator session.');
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
        {/* Aerospace Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>SECURE TERMINAL</Text>
          </View>

          <Text style={styles.titleLine1}>LAUNCH VEHICLE</Text>
          <Text style={styles.titleLine2}>HEALTH MONITOR</Text>
          <Text style={styles.subtitle}>PROPULSION TELEMETRY & SAFETY SYSTEM</Text>
        </View>

        {/* Login Form Box */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>OPERATOR AUTHENTICATION</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>OPERATOR ID / EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="operator@mission-control.org"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SECURITY KEY / PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, submitting && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={submitting || isLoading}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.buttonPrimaryText} size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>AUTHENTICATE & ENTER</Text>
            )}
          </TouchableOpacity>

          {/* Exhibition Quick Access Demo */}
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleDemoAccess}
            disabled={submitting}
          >
            <Text style={styles.demoBtnText}>⚡ EXHIBITION GUEST ACCESS (DEMO)</Text>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>New Flight Operator? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Register Terminal</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Prototype Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>{APP_CONFIG.disclaimer}</Text>
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
    marginBottom: 26,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: Colors.borderGlowCyan,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
    marginBottom: 14,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.cyan,
  },
  badgeText: {
    color: Colors.cyan,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1,
  },
  titleLine1: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 2,
    textAlign: 'center',
  },
  titleLine2: {
    color: Colors.cyan,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
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
    letterSpacing: 0.5,
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
    marginTop: 6,
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
  demoBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.cyan,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
  },
  demoBtnText: {
    color: Colors.cyan,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerPrompt: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  registerLink: {
    color: Colors.cyan,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  disclaimerBox: {
    marginTop: 24,
    paddingHorizontal: 12,
  },
  disclaimerText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 14,
  },
});
