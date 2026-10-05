import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { HealthSeverity, ThresholdConfiguration, Vector3D } from '../types/telemetry';
import { formatAxis, formatVibration } from '../utils/formatting';

interface VibrationIndicatorProps {
  vibration: number;
  acceleration: Vector3D;
  gyroscope: Vector3D;
  thresholds: ThresholdConfiguration;
  status: HealthSeverity;
}

export const VibrationIndicator: React.FC<VibrationIndicatorProps> = ({
  vibration,
  acceleration,
  gyroscope,
  thresholds,
  status,
}) => {
  const isCritical = status === 'CRITICAL';
  const isWarning = status === 'WARNING';
  const statusColor = isCritical ? Colors.critical : isWarning ? Colors.warning : Colors.nominal;

  return (
    <View style={[styles.card, isCritical && { borderColor: Colors.critical }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>VIBRATION & DYNAMICS</Text>
          <Text style={styles.subTitle}>MPU6050 6-DOF IMU</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.topVibSection}>
        <View>
          <Text style={styles.vibLabel}>STRUCTURAL VIBRATION</Text>
          <View style={styles.vibValueRow}>
            <Text style={[styles.vibValue, { color: statusColor }]}>{formatVibration(vibration)}</Text>
            <Text style={styles.unit}>g RMS</Text>
          </View>
        </View>

        <View style={styles.limitsBox}>
          <Text style={styles.limitText}>WARN: {thresholds.warnVibration}g</Text>
          <Text style={[styles.limitText, { color: Colors.critical }]}>MAX: {thresholds.maxVibration}g</Text>
        </View>
      </View>

      {/* 3-Axis Acceleration Grid */}
      <View style={styles.axesContainer}>
        <Text style={styles.sectionHeader}>LINEAR ACCELERATION (g)</Text>
        <View style={styles.axisRow}>
          <View style={styles.axisBox}>
            <Text style={styles.axisLabel}>AXIS-X</Text>
            <Text style={styles.axisVal}>{formatAxis(acceleration.x)}</Text>
          </View>
          <View style={styles.axisBox}>
            <Text style={styles.axisLabel}>AXIS-Y</Text>
            <Text style={styles.axisVal}>{formatAxis(acceleration.y)}</Text>
          </View>
          <View style={styles.axisBox}>
            <Text style={styles.axisLabel}>AXIS-Z</Text>
            <Text style={[styles.axisVal, { color: Colors.cyan }]}>{formatAxis(acceleration.z)}</Text>
          </View>
        </View>
      </View>

      {/* 3-Axis Gyroscope Grid */}
      <View style={styles.axesContainer}>
        <Text style={styles.sectionHeader}>ANGULAR RATE GYROSCOPE (°/s)</Text>
        <View style={styles.axisRow}>
          <View style={styles.axisBox}>
            <Text style={styles.axisLabel}>ROLL (X)</Text>
            <Text style={styles.axisVal}>{formatAxis(gyroscope.x)}</Text>
          </View>
          <View style={styles.axisBox}>
            <Text style={styles.axisLabel}>PITCH (Y)</Text>
            <Text style={styles.axisVal}>{formatAxis(gyroscope.y)}</Text>
          </View>
          <View style={styles.axisBox}>
            <Text style={styles.axisLabel}>YAW (Z)</Text>
            <Text style={styles.axisVal}>{formatAxis(gyroscope.z)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  subTitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  topVibSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  vibLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  vibValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  vibValue: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  unit: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  limitsBox: {
    alignItems: 'flex-end',
    gap: 2,
  },
  limitText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  axesContainer: {
    marginTop: 6,
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  axisBox: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  axisLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  axisVal: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    marginTop: 2,
  },
});
