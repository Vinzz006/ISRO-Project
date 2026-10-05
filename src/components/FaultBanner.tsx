import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { FaultEvent } from '../types/faults';
import { formatCurrent, formatRPM, formatVibration } from '../utils/formatting';

interface FaultBannerProps {
  faults: FaultEvent[];
}

export const FaultBanner: React.FC<FaultBannerProps> = ({ faults }) => {
  if (!faults || faults.length === 0) return null;

  const topFault = faults[0];
  const isCritical = topFault.severity === 'CRITICAL';
  const borderColor = isCritical ? Colors.critical : Colors.warning;
  const bgColor = isCritical ? 'rgba(255, 42, 85, 0.12)' : 'rgba(255, 184, 0, 0.12)';

  return (
    <View style={[styles.card, { borderColor, backgroundColor: bgColor }]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: borderColor }]}>
          <Text style={styles.badgeText}>{topFault.severity} FAULT</Text>
        </View>
        <Text style={styles.typeText}>{topFault.type.replace(/_/g, ' ')}</Text>
      </View>

      <Text style={styles.messageText}>{topFault.message}</Text>

      {topFault.snapshot && (
        <View style={styles.snapshotRow}>
          <Text style={styles.snapText}>RPM: <Text style={styles.snapVal}>{formatRPM(topFault.snapshot.rpm)}</Text></Text>
          <Text style={styles.snapText}>Current: <Text style={styles.snapVal}>{formatCurrent(topFault.snapshot.current)} A</Text></Text>
          <Text style={styles.snapText}>Vib: <Text style={styles.snapVal}>{formatVibration(topFault.snapshot.vibration)} g</Text></Text>
        </View>
      )}

      {faults.length > 1 && (
        <Text style={styles.moreText}>+{faults.length - 1} more active system anomaly</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  typeText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  messageText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  snapText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  snapVal: {
    color: Colors.cyan,
    fontWeight: '700',
  },
  moreText: {
    color: Colors.warning,
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 6,
  },
});
