import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { TelemetryData } from '../types/telemetry';
import { formatCurrent, formatRPM, formatVibration, formatTimestamp } from '../utils/formatting';

interface EmergencyStatusProps {
  isEmergencyStop: boolean;
  reason?: string;
  telemetry: TelemetryData;
  deviceId: string;
  onReset?: () => void;
}

export const EmergencyStatus: React.FC<EmergencyStatusProps> = ({
  isEmergencyStop,
  reason = 'CRITICAL OVERLOAD SAFETY CUTOFF',
  telemetry,
  deviceId,
  onReset,
}) => {
  if (!isEmergencyStop) {
    return null;
  }

  return (
    <View style={styles.emergencyContainer}>
      <View style={styles.headerBar}>
        <Text style={styles.warningIcon}>⚠</Text>
        <Text style={styles.headerTitle}>CRITICAL SYSTEM ALERT</Text>
      </View>

      <Text style={styles.mainTitle}>AUTOMATIC EMERGENCY SHUTDOWN</Text>
      <Text style={styles.subtext}>
        Propulsion motor stopped by autonomous edge safety logic.
      </Text>

      <View style={styles.reasonBox}>
        <Text style={styles.reasonLabel}>PRIMARY ABORT REASON:</Text>
        <Text style={styles.reasonText}>{reason.toUpperCase()}</Text>
      </View>

      <View style={styles.telemetryGrid}>
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryKey}>RPM AT CUTOFF</Text>
          <Text style={styles.telemetryVal}>{formatRPM(telemetry.rpm)}</Text>
        </View>
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryKey}>CURRENT</Text>
          <Text style={styles.telemetryVal}>{formatCurrent(telemetry.current)} A</Text>
        </View>
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryKey}>VIBRATION</Text>
          <Text style={styles.telemetryVal}>{formatVibration(telemetry.vibration)} g</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.metaInfo}>DEVICE: {deviceId} | CUTOFF: {formatTimestamp(telemetry.timestamp)}</Text>
        {onReset && (
          <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
            <Text style={styles.resetBtnText}>RESET INTERLOCK</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emergencyContainer: {
    backgroundColor: '#1E050B',
    borderColor: Colors.critical,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.critical,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  warningIcon: {
    fontSize: 18,
    color: Colors.critical,
  },
  headerTitle: {
    color: Colors.critical,
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  mainTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtext: {
    color: '#FECDD3',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  reasonBox: {
    backgroundColor: 'rgba(255, 42, 85, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.critical,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  reasonLabel: {
    color: '#FDA4AF',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  reasonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  telemetryCol: {
    alignItems: 'center',
  },
  telemetryKey: {
    color: '#FDA4AF',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  telemetryVal: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '800',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaInfo: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  resetBtn: {
    backgroundColor: Colors.critical,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
