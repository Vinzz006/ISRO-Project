import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.radarRing}>
        <ActivityIndicator size="large" color={Colors.cyan} />
      </View>
      <Text style={styles.title}>MISSION CONTROL INITIALIZING</Text>
      <Text style={styles.subtitle}>VERIFYING PROPULSION TELEMETRY LINK...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  radarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: Colors.borderGlowCyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.surfaceElevated,
  },
  title: {
    color: Colors.cyan,
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
