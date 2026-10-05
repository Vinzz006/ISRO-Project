import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { HealthSeverity } from '../types/telemetry';
import { formatTimestamp } from '../utils/formatting';

interface MissionStatusProps {
  status: HealthSeverity;
  timestamp: number;
  phaseTitle?: string;
  isEmergencyStop?: boolean;
}

export const MissionStatus: React.FC<MissionStatusProps> = ({
  status,
  timestamp,
  phaseTitle,
  isEmergencyStop,
}) => {
  let displayStatus = 'SYSTEM NOMINAL';
  let badgeColor = Colors.nominal;
  let glowColor = Colors.nominalGlow;

  if (isEmergencyStop || status === 'CRITICAL') {
    displayStatus = 'CRITICAL ALERT';
    badgeColor = Colors.critical;
    glowColor = Colors.criticalGlow;
  } else if (status === 'WARNING') {
    displayStatus = 'SYSTEM WARNING';
    badgeColor = Colors.warning;
    glowColor = Colors.warningGlow;
  }

  return (
    <View style={[styles.card, { borderColor: badgeColor, shadowColor: badgeColor }]}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.missionHeader}>MISSION CONTROL</Text>
          <Text style={styles.subHeader}>PROPULSION HEALTH TELEMETRY</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>SYS TIME</Text>
          <Text style={styles.timeValue}>{formatTimestamp(timestamp)}</Text>
        </View>
      </View>

      <View style={[styles.statusBanner, { backgroundColor: glowColor, borderColor: badgeColor }]}>
        <View style={styles.statusRow}>
          <View style={[styles.beacon, { backgroundColor: badgeColor }]} />
          <Text style={[styles.statusText, { color: badgeColor }]}>
            {isEmergencyStop ? 'EMERGENCY SHUTDOWN ACTIVE' : displayStatus}
          </Text>
        </View>

        {phaseTitle && (
          <View style={styles.phasePill}>
            <Text style={styles.phaseLabel}>PHASE: </Text>
            <Text style={styles.phaseText}>{phaseTitle}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  missionHeader: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  subHeader: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  timeContainer: {
    alignItems: 'flex-end',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  timeValue: {
    color: Colors.cyan,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beacon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  phaseLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  phaseText: {
    color: Colors.cyan,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
