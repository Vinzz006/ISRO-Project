import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useMission } from '../../context/MissionContext';
import { HealthSeverity } from '../../types/telemetry';
import { FaultEvent } from '../../types/faults';
import { formatCurrent, formatDateTime, formatRPM, formatVibration } from '../../utils/formatting';

export default function FaultsScreen() {
  const { activeFaults, faultHistory, resetFaults, deviceStatus } = useMission();
  const [filterSeverity, setFilterSeverity] = useState<HealthSeverity | 'ALL'>('ALL');

  // Merge active and history for complete searchable log
  const allEvents: FaultEvent[] = [...activeFaults, ...faultHistory].filter((e, idx, arr) => {
    return arr.findIndex((x) => x.id === e.id) === idx;
  });

  const filteredEvents = allEvents.filter((item) => {
    if (filterSeverity === 'ALL') return true;
    return item.severity === filterSeverity;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FLIGHT SAFETY & FAULT LOG</Text>
          <Text style={styles.headerSubtitle}>AUTONOMOUS EDGE PROTECTION EVENTS</Text>
        </View>

        {/* Active Emergency / Fault Interlock Banner */}
        {deviceStatus.emergencyStop && (
          <View style={styles.activeCutoffBox}>
            <View style={styles.cutoffTop}>
              <Text style={styles.cutoffIcon}>⚠</Text>
              <Text style={styles.cutoffTitle}>HARDWARE SAFETY INTERLOCK ENGAGED</Text>
            </View>
            <Text style={styles.cutoffDesc}>
              Motor power severed by primary ESP32 edge cutoff. Clear hardware anomalies before resetting interlock.
            </Text>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFaults}>
              <Text style={styles.resetBtnText}>SEND INTERLOCK RESET SIGNAL</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Severity Filter Tabs */}
        <View style={styles.filterRow}>
          {(['ALL', 'CRITICAL', 'WARNING', 'NOMINAL'] as (HealthSeverity | 'ALL')[]).map((sev) => {
            const active = filterSeverity === sev;
            const label = sev === 'NOMINAL' ? 'INFO' : sev;
            return (
              <TouchableOpacity
                key={sev}
                style={[styles.filterTab, active && styles.filterTabActive]}
                onPress={() => setFilterSeverity(sev)}
              >
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Event List */}
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCheck}>✓</Text>
            <Text style={styles.emptyTitle}>NO ANOMALIES RECORDED</Text>
            <Text style={styles.emptyDesc}>Propulsion flight safety metrics remain nominal.</Text>
          </View>
        ) : (
          filteredEvents.map((event) => {
            const isCritical = event.severity === 'CRITICAL';
            const isWarning = event.severity === 'WARNING';
            const borderColor = isCritical ? Colors.critical : isWarning ? Colors.warning : Colors.info;

            return (
              <View key={event.id} style={[styles.eventCard, { borderLeftColor: borderColor }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.severityPill, { backgroundColor: borderColor }]}>
                    <Text style={styles.severityText}>{event.severity}</Text>
                  </View>
                  <Text style={styles.typeText}>{event.type.replace(/_/g, ' ')}</Text>
                  <Text style={styles.timeText}>{formatDateTime(event.timestamp)}</Text>
                </View>

                <Text style={styles.messageText}>{event.message}</Text>

                {event.snapshot && (
                  <View style={styles.snapshotContainer}>
                    <Text style={styles.snapshotLabel}>TELEMETRY AT ANOMALY CUTOFF:</Text>
                    <View style={styles.snapshotGrid}>
                      <View style={styles.snapItem}>
                        <Text style={styles.snapKey}>RPM</Text>
                        <Text style={styles.snapVal}>{formatRPM(event.snapshot.rpm)}</Text>
                      </View>
                      <View style={styles.snapItem}>
                        <Text style={styles.snapKey}>CURRENT</Text>
                        <Text style={styles.snapVal}>{formatCurrent(event.snapshot.current)} A</Text>
                      </View>
                      <View style={styles.snapItem}>
                        <Text style={styles.snapKey}>VIBRATION</Text>
                        <Text style={styles.snapVal}>{formatVibration(event.snapshot.vibration)} g</Text>
                      </View>
                      <View style={styles.snapItem}>
                        <Text style={styles.snapKey}>PWM</Text>
                        <Text style={styles.snapVal}>{event.snapshot.pwm}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.deviceIdText}>CONTROLLER ID: {event.deviceId}</Text>
                  <Text style={styles.logIdText}>EVENT ID: {event.id}</Text>
                </View>
              </View>
            );
          })
        )}
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
  activeCutoffBox: {
    backgroundColor: '#1E050B',
    borderColor: Colors.critical,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  cutoffTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cutoffIcon: {
    fontSize: 18,
    color: Colors.critical,
  },
  cutoffTitle: {
    color: Colors.critical,
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  cutoffDesc: {
    color: '#FDA4AF',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 10,
  },
  resetBtn: {
    backgroundColor: Colors.critical,
    paddingVertical: 9,
    borderRadius: 6,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: Colors.cyan,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyCheck: {
    color: Colors.nominal,
    fontSize: 28,
    marginBottom: 8,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  emptyDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  severityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '900',
  },
  typeText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    flex: 1,
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  messageText: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  snapshotContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  snapshotLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 6,
  },
  snapshotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  snapItem: {
    alignItems: 'center',
  },
  snapKey: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
  },
  snapVal: {
    color: Colors.cyan,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
    marginTop: 4,
  },
  deviceIdText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  logIdText: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
  },
});
