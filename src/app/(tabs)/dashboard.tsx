import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useMission } from '../../context/MissionContext';
import { useDeviceStatus } from '../../hooks/useDeviceStatus';
import { ConnectionStatus } from '../../components/ConnectionStatus';
import { MissionStatus } from '../../components/MissionStatus';
import { EmergencyStatus } from '../../components/EmergencyStatus';
import { FaultBanner } from '../../components/FaultBanner';
import { RPMGauge } from '../../components/RPMGauge';
import { CurrentGauge } from '../../components/CurrentGauge';
import { VibrationIndicator } from '../../components/VibrationIndicator';
import { HealthScore } from '../../components/HealthScore';
import { SensorCard } from '../../components/SensorCard';
import { TelemetryCard } from '../../components/TelemetryCard';
import { SimulationControlModal } from '../../components/SimulationControlModal';
import { formatUptime } from '../../utils/formatting';

export default function DashboardScreen() {
  const {
    deviceId,
    telemetry,
    deviceStatus,
    sensors,
    thresholds,
    health,
    activeFaults,
    simulationState,
    resetFaults,
    isDemoMode,
  } = useMission();

  const { isOnline, isStale } = useDeviceStatus();
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Connection & Device Bar */}
        <View style={styles.topBar}>
          <ConnectionStatus
            isOnline={isOnline}
            isStale={isStale}
            isDemoMode={isDemoMode}
            deviceId={deviceId}
          />

          {isDemoMode && (
            <TouchableOpacity
              style={styles.simTriggerBtn}
              onPress={() => setSimulationModalOpen(true)}
            >
              <Text style={styles.simTriggerText}>🚀 LAUNCH SIMULATOR</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Primary Mission Status Display */}
        <MissionStatus
          status={health.overallStatus}
          timestamp={telemetry.timestamp}
          phaseTitle={simulationState?.phase?.replace(/_/g, ' ')}
          isEmergencyStop={deviceStatus.emergencyStop}
        />

        {/* Dedicated Emergency Alert Banner */}
        <EmergencyStatus
          isEmergencyStop={deviceStatus.emergencyStop}
          reason={deviceStatus.emergencyReason}
          telemetry={telemetry}
          deviceId={deviceId}
          onReset={resetFaults}
        />

        {/* Active Fault Alerts */}
        <FaultBanner faults={activeFaults} />

        {/* Overall System Health Score */}
        <View style={styles.sectionMargin}>
          <HealthScore health={health} />
        </View>

        {/* Primary Propulsion RPM Tachometer */}
        <View style={styles.sectionMargin}>
          <RPMGauge
            rpm={telemetry.rpm}
            targetRpm={2500}
            thresholds={thresholds}
            status={health.rpmStatus}
            motorRunning={deviceStatus.motorRunning}
          />
        </View>

        {/* Propulsion Current ACS712 Shunt */}
        <View style={styles.sectionMargin}>
          <CurrentGauge
            current={telemetry.current}
            thresholds={thresholds}
            status={health.currentStatus}
          />
        </View>

        {/* Telemetry Quick Tiles (Motor State, PWM Drive, System Uptime) */}
        <View style={[styles.tileRow, styles.sectionMargin]}>
          <TelemetryCard
            title="MOTOR STATE"
            source="ESP32 GPIO"
            value={deviceStatus.motorRunning ? 'RUNNING' : 'STOPPED'}
            status={deviceStatus.emergencyStop ? 'CRITICAL' : deviceStatus.motorRunning ? 'NOMINAL' : 'WARNING'}
            subLabel="PWM LOAD"
            subValue={`${Math.round((telemetry.motorPWM / 255) * 100)}% (${telemetry.motorPWM}/255)`}
          />
          <TelemetryCard
            title="CONTROLLER UPTIME"
            source="MCU TICK"
            value={formatUptime(deviceStatus.uptimeSeconds)}
            status={isOnline ? 'NOMINAL' : 'CRITICAL'}
            subLabel="CYCLE"
            subValue="200 Hz"
          />
        </View>

        {/* Structural Vibration & 6-DOF IMU Readout */}
        <View style={styles.sectionMargin}>
          <VibrationIndicator
            vibration={telemetry.vibration}
            acceleration={telemetry.acceleration}
            gyroscope={telemetry.gyroscope}
            thresholds={thresholds}
            status={health.vibrationStatus}
          />
        </View>

        {/* Hardware & Sensor Telemetry Suite Health */}
        <View style={styles.sectionMargin}>
          <SensorCard sensors={sensors} />
        </View>
      </ScrollView>

      {/* Interactive Launch Sequence Simulation Modal */}
      <SimulationControlModal
        visible={simulationModalOpen}
        onClose={() => setSimulationModalOpen(false)}
      />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  simTriggerBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: Colors.cyan,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  simTriggerText: {
    color: Colors.cyan,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionMargin: {
    marginBottom: 14,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
