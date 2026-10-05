import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { useMission } from '../context/MissionContext';
import { LaunchPhase } from '../services/simulationEngine';
import { FaultType } from '../types/faults';

interface SimulationControlModalProps {
  visible: boolean;
  onClose: () => void;
}

const PHASES: { id: LaunchPhase; label: string; desc: string }[] = [
  { id: 'PRE_LAUNCH', label: '1. PRE-LAUNCH', desc: 'Ground test, motor idle, sensors calibrated' },
  { id: 'IGNITION', label: '2. IGNITION', desc: 'Thrust initiation, initial PWM feed' },
  { id: 'RPM_RISING', label: '3. RPM RISING', desc: 'Ramping to rated velocity' },
  { id: 'NOMINAL_OPERATION', label: '4. NOMINAL FLIGHT', desc: 'Rated speed 2500 RPM, stable current & vibration' },
  { id: 'ANOMALY', label: '5. ANOMALY INDUCED', desc: 'Hardware load spiked beyond warning threshold' },
  { id: 'FAULT_DETECTED', label: '6. FAULT DETECTED', desc: 'Safety controller triggers critical alarm' },
  { id: 'AUTOMATIC_ABORT', label: '7. AUTOMATIC ABORT', desc: 'Autonomous edge cutoff engages; power severed' },
  { id: 'MOTOR_STOPPED', label: '8. MOTOR STOPPED', desc: 'Propulsion at zero RPM, lockout active' },
];

export const SimulationControlModal: React.FC<SimulationControlModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    simulationState,
    setLaunchPhase,
    setAnomalyType,
    toggleAutoAdvance,
    resetSimulation,
  } = useMission();

  if (!simulationState) return null;

  const currentPhase = simulationState.phase;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>LAUNCH SIMULATION CONTROLLER</Text>
              <Text style={styles.subtitle}>EXHIBITION DEMONSTRATION SUITE</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Auto-Advance Toggle Row */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, simulationState.autoAdvance && styles.toggleBtnActive]}
              onPress={() => toggleAutoAdvance(!simulationState.autoAdvance)}
            >
              <Text style={[styles.toggleBtnText, simulationState.autoAdvance && styles.toggleBtnTextActive]}>
                AUTO PROGRESS: {simulationState.autoAdvance ? 'ON' : 'MANUAL'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={resetSimulation}>
              <Text style={styles.resetBtnText}>↺ RESTART MISSION</Text>
            </TouchableOpacity>
          </View>

          {/* Anomaly Selection */}
          <View style={styles.anomalyBox}>
            <Text style={styles.anomalyTitle}>SELECT SIMULATED FAULT PROFILE:</Text>
            <View style={styles.anomalyChips}>
              {(['OVER_CURRENT', 'HIGH_VIBRATION', 'OVERSPEED'] as FaultType[]).map((type) => {
                const active = simulationState.anomalyType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setAnomalyType(type)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {type.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Phase Timeline List */}
          <Text style={styles.phasesHeader}>MISSION FLIGHT PROFILE STAGES:</Text>
          <ScrollView style={styles.phasesScroll} showsVerticalScrollIndicator={false}>
            {PHASES.map((phase, idx) => {
              const isActive = currentPhase === phase.id;
              const isPast = PHASES.findIndex((p) => p.id === currentPhase) > idx;

              return (
                <TouchableOpacity
                  key={phase.id}
                  style={[
                    styles.phaseItem,
                    isActive && styles.phaseItemActive,
                    isPast && styles.phaseItemPast,
                  ]}
                  onPress={() => setLaunchPhase(phase.id)}
                >
                  <View style={styles.phaseIndicator}>
                    <View
                      style={[
                        styles.phaseDot,
                        isActive && styles.phaseDotActive,
                        isPast && styles.phaseDotPast,
                      ]}
                    />
                  </View>
                  <View style={styles.phaseDetails}>
                    <Text style={[styles.phaseLabel, isActive && styles.phaseLabelActive]}>
                      {phase.label}
                    </Text>
                    <Text style={styles.phaseDesc}>{phase.desc}</Text>
                  </View>
                  {isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              Simulates physical propulsion parameters for jury demonstration without live motor risk.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 20, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
  },
  title: {
    color: Colors.cyan,
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  toggleBtnText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: Colors.cyan,
  },
  resetBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  anomalyBox: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  anomalyTitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 6,
  },
  anomalyChips: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: Colors.critical,
    backgroundColor: 'rgba(255, 42, 85, 0.15)',
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  chipTextActive: {
    color: Colors.critical,
  },
  phasesHeader: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 8,
  },
  phasesScroll: {
    maxHeight: 260,
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  phaseItemActive: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
  },
  phaseItemPast: {
    opacity: 0.6,
  },
  phaseIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  phaseDotActive: {
    backgroundColor: Colors.cyan,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  phaseDotPast: {
    backgroundColor: Colors.nominal,
  },
  phaseDetails: {
    flex: 1,
  },
  phaseLabel: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  phaseLabelActive: {
    color: Colors.cyan,
  },
  phaseDesc: {
    color: Colors.textMuted,
    fontSize: 9,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: Colors.cyan,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: Colors.background,
    fontSize: 8,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  footerNote: {
    color: Colors.textMuted,
    fontSize: 9,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
