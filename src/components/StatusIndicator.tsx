import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { HealthSeverity } from '../types/telemetry';

interface StatusIndicatorProps {
  status: HealthSeverity | 'ONLINE' | 'OFFLINE' | 'STALE' | 'UNKNOWN';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const getColor = () => {
    switch (status) {
      case 'NOMINAL':
      case 'ONLINE':
        return Colors.nominal;
      case 'WARNING':
      case 'STALE':
        return Colors.warning;
      case 'CRITICAL':
      case 'OFFLINE':
        return Colors.critical;
      default:
        return Colors.textMuted;
    }
  };

  const getGlow = () => {
    switch (status) {
      case 'NOMINAL':
      case 'ONLINE':
        return Colors.nominalGlow;
      case 'WARNING':
      case 'STALE':
        return Colors.warningGlow;
      case 'CRITICAL':
      case 'OFFLINE':
        return Colors.criticalGlow;
      default:
        return 'transparent';
    }
  };

  const color = getColor();
  const glow = getGlow();

  const dotSize = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;

  return (
    <View style={styles.container}>
      <View style={[styles.glowRing, { backgroundColor: glow, width: dotSize * 2.2, height: dotSize * 2.2 }]}>
        <View style={[styles.dot, { backgroundColor: color, width: dotSize, height: dotSize }]} />
      </View>
      {label ? (
        <Text style={[styles.label, { color, fontSize: size === 'sm' ? 11 : size === 'lg' ? 14 : 12 }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  glowRing: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 999,
  },
  label: {
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
