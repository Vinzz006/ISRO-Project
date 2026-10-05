import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TelemetryData, HealthStatus, ThresholdConfiguration, TelemetryHistoryPoint } from '../types/telemetry';
import { DeviceStatus, SensorStatus } from '../types/device';
import { FaultEvent, FaultType } from '../types/faults';
import { DEFAULT_DEVICE_ID, DEFAULT_THRESHOLDS, APP_CONFIG } from '../constants/config';
import { calculateHealthScore } from '../utils/healthCalculation';
import { telemetryService } from '../services/telemetryService';
import { deviceService } from '../services/deviceService';
import { faultService } from '../services/faultService';
import { isFirebaseConfigured } from '../services/firebase';
import { simulationEngine, LaunchPhase, SimulationState } from '../services/simulationEngine';

const DEMO_MODE_STORAGE_KEY = '@mission_control_demo_mode';
const SELECTED_DEVICE_KEY = '@mission_control_selected_device';

interface MissionContextType {
  deviceId: string;
  setDeviceId: (id: string) => void;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  isFirebaseAvailable: boolean;

  // Live state
  telemetry: TelemetryData;
  deviceStatus: DeviceStatus;
  sensors: SensorStatus;
  thresholds: ThresholdConfiguration;
  health: HealthStatus;
  activeFaults: FaultEvent[];
  faultHistory: FaultEvent[];
  telemetryHistory: TelemetryHistoryPoint[];

  // Simulation state
  simulationState: SimulationState | null;
  setLaunchPhase: (phase: LaunchPhase) => void;
  setAnomalyType: (type: FaultType) => void;
  toggleAutoAdvance: (enabled: boolean) => void;
  resetSimulation: () => void;

  // Device control commands
  armSystem: () => Promise<void>;
  startMotor: () => Promise<void>;
  stopMotor: () => Promise<void>;
  emergencyShutdown: (reason?: string) => Promise<void>;
  resetFaults: () => Promise<void>;
  updateThresholds: (newThresholds: Partial<ThresholdConfiguration>) => Promise<void>;
}

const initialTelemetry: TelemetryData = {
  rpm: 0,
  current: 0,
  vibration: 0,
  acceleration: { x: 0, y: 0, z: 1.0 },
  gyroscope: { x: 0, y: 0, z: 0 },
  motorPWM: 0,
  timestamp: Date.now(),
};

const initialDeviceStatus: DeviceStatus = {
  online: false,
  lastSeen: Date.now(),
  motorRunning: false,
  motorState: 'STOPPED',
  emergencyStop: false,
  firmwareVersion: 'v1.0.0',
  uptimeSeconds: 0,
};

const initialSensors: SensorStatus = {
  hallSensor: 'UNKNOWN',
  mpu6050: 'UNKNOWN',
  currentSensor: 'UNKNOWN',
  esp32: 'UNKNOWN',
  wifi: 'UNKNOWN',
  firebase: 'UNKNOWN',
  lastUpdated: Date.now(),
};

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceId, setDeviceIdState] = useState<string>(DEFAULT_DEVICE_ID);
  // Default to demo mode if Firebase is not yet configured, otherwise allow user preference
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(!isFirebaseConfigured);

  const [telemetry, setTelemetry] = useState<TelemetryData>(initialTelemetry);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>(initialDeviceStatus);
  const [sensors, setSensors] = useState<SensorStatus>(initialSensors);
  const [thresholds, setThresholds] = useState<ThresholdConfiguration>(DEFAULT_THRESHOLDS);
  const [activeFaults, setActiveFaults] = useState<FaultEvent[]>([]);
  const [faultHistory, setFaultHistory] = useState<FaultEvent[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryHistoryPoint[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);

  // Load persisted device and mode preferences
  useEffect(() => {
    (async () => {
      try {
        const storedDevice = await AsyncStorage.getItem(SELECTED_DEVICE_KEY);
        if (storedDevice) setDeviceIdState(storedDevice);

        const storedDemo = await AsyncStorage.getItem(DEMO_MODE_STORAGE_KEY);
        if (storedDemo !== null) {
          setIsDemoModeState(JSON.parse(storedDemo));
        } else if (!isFirebaseConfigured) {
          setIsDemoModeState(true);
        }
      } catch (err) {
        console.warn('Failed to load mission preferences', err);
      }
    })();
  }, []);

  const setDeviceId = useCallback(async (id: string) => {
    setDeviceIdState(id);
    await AsyncStorage.setItem(SELECTED_DEVICE_KEY, id);
  }, []);

  const setDemoMode = useCallback(async (enabled: boolean) => {
    setIsDemoModeState(enabled);
    await AsyncStorage.setItem(DEMO_MODE_STORAGE_KEY, JSON.stringify(enabled));
  }, []);

  // Set up central subscriptions for the selected device and mode
  useEffect(() => {
    let unsubTelemetry: (() => void) | undefined;
    let unsubStatus: (() => void) | undefined;
    let unsubSensors: (() => void) | undefined;
    let unsubThresholds: (() => void) | undefined;
    let unsubFaults: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;
    let unsubSim: (() => void) | undefined;

    if (isDemoMode) {
      // Start local simulation engine
      simulationEngine.start();
      unsubSim = simulationEngine.subscribe((tel, dev, sen, faults, state) => {
        setTelemetry(tel);
        setDeviceStatus(dev);
        setSensors(sen);
        setActiveFaults(faults);
        setSimulationState({ ...state });

        // Add to historical rolling buffer
        setTelemetryHistory((prev) => {
          const next = [...prev, {
            timestamp: tel.timestamp,
            rpm: tel.rpm,
            current: tel.current,
            vibration: tel.vibration,
            motorPWM: tel.motorPWM,
          }];
          if (next.length > APP_CONFIG.telemetryHistoryMaxPoints) {
            return next.slice(next.length - APP_CONFIG.telemetryHistoryMaxPoints);
          }
          return next;
        });
      });
    } else {
      // Stop simulation engine in live mode
      simulationEngine.stop();
      queueMicrotask(() => {
        setSimulationState(null);
      });

      // Subscribe to live Firebase RTDB
      unsubTelemetry = telemetryService.subscribeToTelemetry(deviceId, false, (newTelemetry) => {
        setTelemetry(newTelemetry);
        setTelemetryHistory((prev) => {
          const next = [...prev, {
            timestamp: newTelemetry.timestamp,
            rpm: newTelemetry.rpm,
            current: newTelemetry.current,
            vibration: newTelemetry.vibration,
            motorPWM: newTelemetry.motorPWM,
          }];
          if (next.length > APP_CONFIG.telemetryHistoryMaxPoints) {
            return next.slice(next.length - APP_CONFIG.telemetryHistoryMaxPoints);
          }
          return next;
        });
      });

      unsubStatus = deviceService.subscribeToDeviceStatus(deviceId, false, (status) => {
        setDeviceStatus(status);
      });

      unsubSensors = deviceService.subscribeToSensors(deviceId, false, (sen) => {
        setSensors(sen);
      });

      unsubThresholds = deviceService.subscribeToThresholds(deviceId, (thresh) => {
        setThresholds(thresh);
      });

      unsubFaults = faultService.subscribeToActiveFaults(deviceId, false, (faults) => {
        setActiveFaults(faults);
      });

      unsubEvents = faultService.subscribeToEvents(deviceId, false, 50, (events) => {
        setFaultHistory(events);
      });

      // Load initial historical records
      telemetryService.fetchHistoricalTelemetry(deviceId, 60).then((points) => {
        if (points.length > 0) {
          setTelemetryHistory(points);
        }
      });
    }

    return () => {
      unsubTelemetry?.();
      unsubStatus?.();
      unsubSensors?.();
      unsubThresholds?.();
      unsubFaults?.();
      unsubEvents?.();
      unsubSim?.();
    };
  }, [deviceId, isDemoMode]);

  // Compute overall health score in real-time
  const health = useMemo(() => {
    return calculateHealthScore({
      telemetry,
      deviceStatus,
      sensors,
      thresholds,
      activeFaults,
    });
  }, [telemetry, deviceStatus, sensors, thresholds, activeFaults]);

  // Simulation controls
  const setLaunchPhase = useCallback((phase: LaunchPhase) => {
    simulationEngine.setPhase(phase);
  }, []);

  const setAnomalyType = useCallback((type: FaultType) => {
    simulationEngine.setAnomalyType(type);
  }, []);

  const toggleAutoAdvance = useCallback((enabled: boolean) => {
    simulationEngine.toggleAutoAdvance(enabled);
  }, []);

  const resetSimulation = useCallback(() => {
    simulationEngine.reset('PRE_LAUNCH');
  }, []);

  // Mobile safety controls
  const armSystem = useCallback(async () => {
    await deviceService.sendControlCommand(deviceId, { armed: true }, isDemoMode);
  }, [deviceId, isDemoMode]);

  const startMotor = useCallback(async () => {
    await deviceService.sendControlCommand(deviceId, { armed: true, motorEnabled: true }, isDemoMode);
  }, [deviceId, isDemoMode]);

  const stopMotor = useCallback(async () => {
    await deviceService.sendControlCommand(deviceId, { motorEnabled: false }, isDemoMode);
  }, [deviceId, isDemoMode]);

  const emergencyShutdown = useCallback(async (reason: string = 'MANUAL EMERGENCY STOP') => {
    await deviceService.sendControlCommand(deviceId, { emergencyStop: true, motorEnabled: false }, isDemoMode);
    if (!isDemoMode) {
      await faultService.recordFaultEvent(deviceId, {
        deviceId,
        type: 'MANUAL_ABORT',
        severity: 'CRITICAL',
        message: `Emergency cutoff triggered from Mission Control app: ${reason}`,
        timestamp: Date.now(),
        snapshot: {
          rpm: telemetry.rpm,
          current: telemetry.current,
          vibration: telemetry.vibration,
          pwm: telemetry.motorPWM,
          timestamp: telemetry.timestamp,
        },
      });
    }
  }, [deviceId, isDemoMode, telemetry]);

  const resetFaults = useCallback(async () => {
    await deviceService.sendControlCommand(deviceId, { resetFaults: true, emergencyStop: false }, isDemoMode);
  }, [deviceId, isDemoMode]);

  const updateThresholdsHandler = useCallback(async (newThresholds: Partial<ThresholdConfiguration>) => {
    setThresholds((prev) => ({ ...prev, ...newThresholds }));
    if (!isDemoMode) {
      await deviceService.updateThresholds(deviceId, newThresholds);
    }
  }, [deviceId, isDemoMode]);

  return (
    <MissionContext.Provider
      value={{
        deviceId,
        setDeviceId,
        isDemoMode,
        setDemoMode,
        isFirebaseAvailable: isFirebaseConfigured,
        telemetry,
        deviceStatus,
        sensors,
        thresholds,
        health,
        activeFaults,
        faultHistory,
        telemetryHistory,
        simulationState,
        setLaunchPhase,
        setAnomalyType,
        toggleAutoAdvance,
        resetSimulation,
        armSystem,
        startMotor,
        stopMotor,
        emergencyShutdown,
        resetFaults,
        updateThresholds: updateThresholdsHandler,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export function useMission() {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
}
