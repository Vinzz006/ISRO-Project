import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useMission } from '../../context/MissionContext';
import { useAuth } from '../../context/AuthContext';
import { AVAILABLE_DEVICES } from '../../constants/config';
import { SimulationControlModal } from '../../components/SimulationControlModal';

export default function SettingsScreen() {
  const {
    deviceId,
    setDeviceId,
    isDemoMode,
    setDemoMode,
    thresholds,
    updateThresholds,
    isFirebaseAvailable,
  } = useMission();

  const { user, logout } = useAuth();

  // Local state for editing thresholds
  const [minRPM, setMinRPM] = useState(thresholds.minRPM.toString());
  const [maxRPM, setMaxRPM] = useState(thresholds.maxRPM.toString());
  const [warnRPM, setWarnRPM] = useState(thresholds.warnRPM.toString());
  const [maxCurrent, setMaxCurrent] = useState(thresholds.maxCurrent.toString());
  const [warnCurrent, setWarnCurrent] = useState(thresholds.warnCurrent.toString());
  const [maxVib, setMaxVib] = useState(thresholds.maxVibration.toString());
  const [warnVib, setWarnVib] = useState(thresholds.warnVibration.toString());
  const [simModalOpen, setSimModalOpen] = useState(false);

  const handleSaveThresholds = async () => {
    try {
      await updateThresholds({
        minRPM: Number(minRPM) || thresholds.minRPM,
        maxRPM: Number(maxRPM) || thresholds.maxRPM,
        warnRPM: Number(warnRPM) || thresholds.warnRPM,
        maxCurrent: Number(maxCurrent) || thresholds.maxCurrent,
        warnCurrent: Number(warnCurrent) || thresholds.warnCurrent,
        maxVibration: Number(maxVib) || thresholds.maxVibration,
        warnVibration: Number(warnVib) || thresholds.warnVibration,
      });
      Alert.alert('THRESHOLDS SAVED', 'Propulsion safety thresholds updated in system configuration.');
    } catch {
      Alert.alert('ERROR', 'Failed to save thresholds.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('LOGOUT TERMINAL', 'Disconnect operator session?', [
      { text: 'CANCEL', style: 'cancel' },
      {
        text: 'LOGOUT',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MISSION CONFIGURATION</Text>
          <Text style={styles.headerSubtitle}>TELEMETRY BUS, THRESHOLDS & MODES</Text>
        </View>

        {/* Operating Mode Selector (LIVE vs DEMO) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SYSTEM OPERATING MODE</Text>

          <View style={styles.modeToggleRow}>
            <View style={styles.modeTextCol}>
              <Text style={styles.modeName}>
                {isDemoMode ? 'EXHIBITION DEMO MODE' : 'LIVE HARDWARE LINK'}
              </Text>
              <Text style={styles.modeDesc}>
                {isDemoMode
                  ? 'Simulating physical rocket dynamics for live jury presentation.'
                  : 'Receiving live packets from ESP32 via Firebase Realtime Database.'}
              </Text>
            </View>
            <Switch
              value={isDemoMode}
              onValueChange={setDemoMode}
              trackColor={{ false: Colors.border, true: 'rgba(0, 240, 255, 0.4)' }}
              thumbColor={isDemoMode ? Colors.cyan : Colors.textMuted}
            />
          </View>

          {isDemoMode && (
            <TouchableOpacity style={styles.simModalBtn} onPress={() => setSimModalOpen(true)}>
              <Text style={styles.simModalBtnText}>🚀 OPEN LAUNCH SIMULATION CONTROLLER</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Device Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ACTIVE STAGE / DEVICE IDENTIFIER</Text>
          {AVAILABLE_DEVICES.map((dev) => {
            const selected = dev.id === deviceId;
            return (
              <TouchableOpacity
                key={dev.id}
                style={[styles.deviceOption, selected && styles.deviceOptionSelected]}
                onPress={() => setDeviceId(dev.id)}
              >
                <View>
                  <Text style={[styles.deviceIdText, selected && styles.deviceIdTextSelected]}>
                    {dev.id}
                  </Text>
                  <Text style={styles.deviceNameText}>{dev.name}</Text>
                </View>
                {selected && (
                  <View style={styles.checkPill}>
                    <Text style={styles.checkText}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Central Safety Threshold Configuration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CENTRAL PROPULSION SAFETY THRESHOLDS</Text>
          <Text style={styles.thresholdNotice}>
            Thresholds govern real-time health grading and trigger edge safety alarms.
          </Text>

          <View style={styles.inputGrid}>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>MIN RPM (STALL)</Text>
              <TextInput
                style={styles.textInput}
                value={minRPM}
                onChangeText={setMinRPM}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>WARN RPM</Text>
              <TextInput
                style={styles.textInput}
                value={warnRPM}
                onChangeText={setWarnRPM}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>CUTOFF RPM (MAX)</Text>
              <TextInput
                style={[styles.textInput, { color: Colors.critical }]}
                value={maxRPM}
                onChangeText={setMaxRPM}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGrid}>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>WARN CURRENT (A)</Text>
              <TextInput
                style={styles.textInput}
                value={warnCurrent}
                onChangeText={setWarnCurrent}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>CUTOFF CURRENT (A)</Text>
              <TextInput
                style={[styles.textInput, { color: Colors.critical }]}
                value={maxCurrent}
                onChangeText={setMaxCurrent}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGrid}>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>WARN VIBRATION (g)</Text>
              <TextInput
                style={styles.textInput}
                value={warnVib}
                onChangeText={setWarnVib}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>CUTOFF VIBRATION (g)</Text>
              <TextInput
                style={[styles.textInput, { color: Colors.critical }]}
                value={maxVib}
                onChangeText={setMaxVib}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveThresholds}>
            <Text style={styles.saveBtnText}>COMMIT THRESHOLD CHANGES</Text>
          </TouchableOpacity>
        </View>

        {/* Cloud Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>FIREBASE CLOUD INTEGRATION</Text>
          <View style={styles.cloudRow}>
            <Text style={styles.cloudLabel}>REALTIME DATABASE</Text>
            <Text style={[styles.cloudVal, { color: isFirebaseAvailable ? Colors.nominal : Colors.warning }]}>
              {isFirebaseAvailable ? 'CONFIGURED & CONNECTED' : 'EXHIBITION FALLBACK'}
            </Text>
          </View>
          <View style={styles.cloudRow}>
            <Text style={styles.cloudLabel}>AUTHENTICATION</Text>
            <Text style={styles.cloudVal}>FIREBASE AUTH (EMAIL/PASS)</Text>
          </View>
        </View>

        {/* Operator Profile & Logout */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>FLIGHT OPERATOR SESSION</Text>
          <View style={styles.cloudRow}>
            <Text style={styles.cloudLabel}>OPERATOR ID</Text>
            <Text style={styles.cloudVal}>{user?.email || 'Demo Operator'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>DISCONNECT OPERATOR TERMINAL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SimulationControlModal
        visible={simModalOpen}
        onClose={() => setSimModalOpen(false)}
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
  modeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modeTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  modeName: {
    color: Colors.cyan,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  modeDesc: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  simModalBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: Colors.cyan,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  simModalBtnText: {
    color: Colors.cyan,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  deviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceOptionSelected: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  deviceIdText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  deviceIdTextSelected: {
    color: Colors.cyan,
  },
  deviceNameText: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  checkPill: {
    backgroundColor: Colors.cyan,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  checkText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  thresholdNotice: {
    color: Colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 10,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  inputItem: {
    flex: 1,
  },
  inputLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 6,
    color: Colors.textPrimary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: Colors.buttonPrimaryText,
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cloudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  cloudLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  cloudVal: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 42, 85, 0.15)',
    borderColor: Colors.critical,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutBtnText: {
    color: Colors.critical,
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 11,
  },
});
