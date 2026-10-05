import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { SensorState, SensorStatus } from '../types/device';
import { StatusIndicator } from './StatusIndicator';

interface SensorCardProps {
  sensors: SensorStatus;
}

export const SensorCard: React.FC<SensorCardProps> = ({ sensors }) => {
  const sensorList: { name: string; key: keyof SensorStatus; label: string }[] = [
    { name: 'HALL EFFECT SENSOR', key: 'hallSensor', label: 'RPM TACHOMETER' },
    { name: 'MPU6050 IMU', key: 'mpu6050', label: '6-AXIS DYNAMICS' },
    { name: 'ACS712 SENSOR', key: 'currentSensor', label: 'CURRENT SHUNT' },
    { name: 'ESP32 CONTROLLER', key: 'esp32', label: 'PRIMARY SAFETY MCU' },
    { name: 'WI-FI TELEMETRY', key: 'wifi', label: '802.11 RADIO LINK' },
    { name: 'FIREBASE RTDB', key: 'firebase', label: 'CLOUD PUB/SUB' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>SENSOR & HARDWARE BUS HEALTH</Text>
        <Text style={styles.subTitle}>TELEMETRY SUITE</Text>
      </View>

      <View style={styles.grid}>
        {sensorList.map((item) => {
          const state = (sensors[item.key] as SensorState) || 'UNKNOWN';
          const indicatorStatus =
            state === 'CONNECTED' ? 'NOMINAL' : state === 'WARNING' ? 'WARNING' : 'CRITICAL';

          return (
            <View key={item.key} style={styles.row}>
              <View>
                <Text style={styles.sensorName}>{item.name}</Text>
                <Text style={styles.sensorRole}>{item.label}</Text>
              </View>
              <StatusIndicator status={indicatorStatus} label={state} size="sm" />
            </View>
          );
        })}
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
    alignItems: 'baseline',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 6,
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
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sensorName: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  sensorRole: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 1,
  },
});
