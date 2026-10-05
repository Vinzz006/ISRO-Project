import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { StatusIndicator } from './StatusIndicator';

interface ConnectionStatusProps {
  isOnline: boolean;
  isStale: boolean;
  isDemoMode: boolean;
  deviceId: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline,
  isStale,
  isDemoMode,
  deviceId,
}) => {
  let statusText = 'ONLINE';
  let indicatorStatus: 'ONLINE' | 'OFFLINE' | 'STALE' = 'ONLINE';

  if (!isOnline) {
    statusText = 'OFFLINE';
    indicatorStatus = 'OFFLINE';
  } else if (isStale) {
    statusText = 'TELEMETRY STALE';
    indicatorStatus = 'STALE';
  }

  return (
    <View style={styles.container}>
      <View style={styles.devicePill}>
        <Text style={styles.deviceLabel}>DEVICE</Text>
        <Text style={styles.deviceId}>{deviceId}</Text>
      </View>

      <View style={styles.statusPill}>
        <StatusIndicator status={indicatorStatus} label={statusText} size="sm" />
      </View>

      {isDemoMode && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoText}>SIMULATED DEMO MODE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  devicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  deviceLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  deviceId: {
    color: Colors.cyan,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  statusPill: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  demoBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: Colors.cyan,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  demoText: {
    color: Colors.cyan,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
