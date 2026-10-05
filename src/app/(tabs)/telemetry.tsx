import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useMission } from '../../context/MissionContext';
import { TelemetryChart } from '../../components/TelemetryChart';
import { TelemetryCard } from '../../components/TelemetryCard';
import { formatAxis, formatCurrent, formatRPM, formatVibration } from '../../utils/formatting';

export default function TelemetryScreen() {
  const { telemetry, telemetryHistory, health } = useMission();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LIVE TELEMETRY WAVEFORMS</Text>
          <Text style={styles.headerSubtitle}>HIGH-FREQUENCY PROPULSION DATA STREAM</Text>
        </View>

        {/* Primary Interactive Telemetry Graph */}
        <View style={styles.sectionMargin}>
          <TelemetryChart data={telemetryHistory} />
        </View>

        {/* Live Instantaneous Numeric Stream Grid */}
        <Text style={styles.subHeading}>INSTANTANEOUS TELEMETRY READOUT</Text>
        <View style={[styles.tileRow, styles.sectionMargin]}>
          <TelemetryCard
            title="TACHOMETER"
            source="HALL SENSOR"
            value={formatRPM(telemetry.rpm)}
            unit="RPM"
            status={health.rpmStatus}
            subLabel="CYCLE"
            subValue="LIVE"
          />
          <TelemetryCard
            title="MOTOR SHUNT"
            source="ACS712"
            value={formatCurrent(telemetry.current)}
            unit="A"
            status={health.currentStatus}
            subLabel="CURRENT"
            subValue={telemetry.current > 1.3 ? 'HIGH' : 'NORMAL'}
          />
        </View>

        <View style={[styles.tileRow, styles.sectionMargin]}>
          <TelemetryCard
            title="VIBRATION"
            source="MPU6050"
            value={formatVibration(telemetry.vibration)}
            unit="g RMS"
            status={health.vibrationStatus}
            subLabel="PEAK"
            subValue="FILTERED"
          />
          <TelemetryCard
            title="PWM DRIVE"
            source="ESP32 TIMER"
            value={telemetry.motorPWM}
            unit="/255"
            status={telemetry.motorPWM > 0 ? 'NOMINAL' : 'WARNING'}
            subLabel="DUTY"
            subValue={`${Math.round((telemetry.motorPWM / 255) * 100)}%`}
          />
        </View>

        {/* 6-DOF Inertial Dynamics Breakdown */}
        <View style={[styles.inertialCard, styles.sectionMargin]}>
          <Text style={styles.inertialTitle}>MPU-6050 INERTIAL MEASUREMENT UNIT (IMU)</Text>

          <View style={styles.imuSection}>
            <Text style={styles.imuLabel}>3-AXIS ACCELEROMETER DYNAMICS</Text>
            <View style={styles.imuGrid}>
              <View style={styles.imuCol}>
                <Text style={styles.axisTag}>X (Lateral)</Text>
                <Text style={styles.axisValue}>{formatAxis(telemetry.acceleration.x)} g</Text>
              </View>
              <View style={styles.imuCol}>
                <Text style={styles.axisTag}>Y (Transverse)</Text>
                <Text style={styles.axisValue}>{formatAxis(telemetry.acceleration.y)} g</Text>
              </View>
              <View style={styles.imuCol}>
                <Text style={styles.axisTag}>Z (Thrust Axis)</Text>
                <Text style={[styles.axisValue, { color: Colors.cyan }]}>
                  {formatAxis(telemetry.acceleration.z)} g
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.imuSection, { marginTop: 12 }]}>
            <Text style={styles.imuLabel}>3-AXIS GYROSCOPIC ANGULAR VELOCITY</Text>
            <View style={styles.imuGrid}>
              <View style={styles.imuCol}>
                <Text style={styles.axisTag}>ROLL (ωx)</Text>
                <Text style={styles.axisValue}>{formatAxis(telemetry.gyroscope.x)} °/s</Text>
              </View>
              <View style={styles.imuCol}>
                <Text style={styles.axisTag}>PITCH (ωy)</Text>
                <Text style={styles.axisValue}>{formatAxis(telemetry.gyroscope.y)} °/s</Text>
              </View>
              <View style={styles.imuCol}>
                <Text style={styles.axisTag}>YAW (ωz)</Text>
                <Text style={styles.axisValue}>{formatAxis(telemetry.gyroscope.z)} °/s</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 14,
  },
  headerTitle: {
    color: Colors.cyan,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  subHeading: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionMargin: {
    marginBottom: 14,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inertialCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  inertialTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
    marginBottom: 10,
  },
  imuSection: {},
  imuLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 6,
  },
  imuGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  imuCol: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  axisTag: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
  },
  axisValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    marginTop: 3,
  },
});
