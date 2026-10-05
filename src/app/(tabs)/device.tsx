import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useDeviceStatus } from '../../hooks/useDeviceStatus';
import { StatusIndicator } from '../../components/StatusIndicator';
import { formatDateTime, formatUptime } from '../../utils/formatting';

export default function DeviceScreen() {
  const {
    deviceId,
    deviceStatus,
    isOnline,
    isStale,
    armSystem,
    startMotor,
    stopMotor,
    emergencyShutdown,
    resetFaults,
  } = useDeviceStatus();

  const [armed, setArmed] = useState(false);

  const handleArmToggle = () => {
    if (!armed) {
      Alert.alert(
        'ARM PROPULSION SYSTEM',
        'Warning: Arming enables propulsion ignition commands. Ensure physical motor test stand is clear of personnel.',
        [
          { text: 'CANCEL', style: 'cancel' },
          {
            text: 'ARM SYSTEM',
            style: 'destructive',
            onPress: async () => {
              setArmed(true);
              await armSystem();
            },
          },
        ]
      );
    } else {
      setArmed(false);
    }
  };

  const handleStartMotor = () => {
    if (!armed) {
      Alert.alert('SYSTEM NOT ARMED', 'You must arm the safety interlock before starting propulsion.');
      return;
    }
    Alert.alert(
      'INITIATE PROPULSION IGNITION',
      'Send motor start command to ESP32 controller?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'START',
          onPress: async () => {
            await startMotor();
          },
        },
      ]
    );
  };

  const handleEmergencyStop = () => {
    Alert.alert(
      'EMERGENCY PROPULSION CUTOFF',
      'Send immediate cutoff signal to ESP32 controller?',
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'ABORT MOTOR',
          style: 'destructive',
          onPress: async () => {
            setArmed(false);
            await emergencyShutdown('OPERATOR MANUAL ABORT VIA MOBILE TERMINAL');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>HARDWARE CONTROLLER ARCHITECTURE</Text>
          <Text style={styles.headerSubtitle}>ESP32 EDGE AUTONOMOUS SAFETY SYSTEM</Text>
        </View>

        {/* Hardware Safety Principle Callout */}
        <View style={styles.safetyCallout}>
          <Text style={styles.calloutTitle}>🛡 PRIMARY SAFETY CONTROLLER PRINCIPLE</Text>
          <Text style={styles.calloutText}>
            The ESP32 microcontroller executes autonomous 200 Hz edge safety loops. Motor overcurrent,
            excessive vibration, and overspeed cutoffs occur directly on the physical hardware driver,
            independent of cloud or mobile connectivity.
          </Text>
        </View>

        {/* Device Identity & Specifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CONTROLLER SPECIFICATIONS</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DEVICE IDENTIFIER</Text>
            <Text style={styles.infoValCyan}>{deviceId}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ESP32 LINK STATUS</Text>
            <StatusIndicator
              status={isOnline ? 'ONLINE' : isStale ? 'STALE' : 'OFFLINE'}
              label={isOnline ? 'ONLINE / HEALTHY' : isStale ? 'TELEMETRY STALE' : 'OFFLINE'}
              size="sm"
            />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>FIRMWARE REVISION</Text>
            <Text style={styles.infoVal}>{deviceStatus.firmwareVersion}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MCU CONTINUOUS UPTIME</Text>
            <Text style={styles.infoVal}>{formatUptime(deviceStatus.uptimeSeconds)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>LAST TELEMETRY PACKET</Text>
            <Text style={styles.infoVal}>{formatDateTime(deviceStatus.lastSeen)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>WI-FI NETWORK (SSID)</Text>
            <Text style={styles.infoVal}>{deviceStatus.wifiSSID || 'ISRO_LAB_NET_2.4G'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>RADIO SIGNAL STRENGTH</Text>
            <Text style={styles.infoVal}>
              {deviceStatus.wifiRSSI ? `${deviceStatus.wifiRSSI} dBm` : '-54 dBm (GOOD)'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EDGE IP ADDRESS</Text>
            <Text style={styles.infoVal}>{deviceStatus.ipAddress || '192.168.1.144'}</Text>
          </View>
        </View>

        {/* Propulsion Test Control Interface */}
        <View style={styles.card}>
          <View style={styles.controlHeader}>
            <View>
              <Text style={styles.cardTitle}>PROPULSION COMMAND INTERLOCK</Text>
              <Text style={styles.controlSub}>SAFE BIDIRECTIONAL CONTROL SUITE</Text>
            </View>
            <View style={[styles.armedPill, armed && styles.armedPillActive]}>
              <Text style={[styles.armedText, armed && styles.armedTextActive]}>
                {armed ? 'SYSTEM ARMED' : 'SAFE / DISARMED'}
              </Text>
            </View>
          </View>

          <View style={styles.btnGrid}>
            <TouchableOpacity
              style={[styles.armBtn, armed && styles.armBtnActive]}
              onPress={handleArmToggle}
            >
              <Text style={[styles.armBtnText, armed && styles.armBtnTextActive]}>
                {armed ? 'DISARM SYSTEM' : 'ARM PROPULSION'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.startBtn, (!armed || deviceStatus.motorRunning) && styles.btnDisabled]}
              onPress={handleStartMotor}
              disabled={!armed || deviceStatus.motorRunning}
            >
              <Text style={styles.startBtnText}>START MOTOR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stopBtn, !deviceStatus.motorRunning && styles.btnDisabled]}
              onPress={stopMotor}
              disabled={!deviceStatus.motorRunning}
            >
              <Text style={styles.stopBtnText}>STOP MOTOR</Text>
            </TouchableOpacity>
          </View>

          {/* Prominent Emergency Abort Button */}
          <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergencyStop}>
            <Text style={styles.emergencyBtnText}>⚡ EMERGENCY CUTOFF (ABORT)</Text>
          </TouchableOpacity>

          {deviceStatus.emergencyStop && (
            <TouchableOpacity style={styles.resetBtn} onPress={resetFaults}>
              <Text style={styles.resetBtnText}>RESET HARDWARE INTERLOCK</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.safeNote}>
            Notice: Mobile control commands require physical hardware driver verification.
          </Text>
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
    fontSize: 15,
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
  safetyCallout: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: Colors.borderGlowCyan,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  calloutTitle: {
    color: Colors.cyan,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    marginBottom: 4,
  },
  calloutText: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 42, 84, 0.4)',
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  infoVal: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  infoValCyan: {
    color: Colors.cyan,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  controlSub: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  armedPill: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  armedPillActive: {
    borderColor: Colors.warning,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
  },
  armedText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  armedTextActive: {
    color: Colors.warning,
  },
  btnGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  armBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  armBtnActive: {
    borderColor: Colors.warning,
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
  },
  armBtnText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  armBtnTextActive: {
    color: Colors.warning,
  },
  startBtn: {
    flex: 1,
    backgroundColor: Colors.nominal,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  startBtnText: {
    color: Colors.background,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  stopBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  stopBtnText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  emergencyBtn: {
    backgroundColor: Colors.critical,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  emergencyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 1,
  },
  resetBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.cyan,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  resetBtnText: {
    color: Colors.cyan,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  safeNote: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 10,
  },
});
