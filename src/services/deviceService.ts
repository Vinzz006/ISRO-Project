import { ref, onValue, off, update } from 'firebase/database';
import { rtdb, isFirebaseConfigured } from './firebase';
import { DeviceControl, DeviceStatus, SensorStatus } from '../types/device';
import { ThresholdConfiguration } from '../types/telemetry';
import { DEFAULT_THRESHOLDS } from '../constants/config';
import { simulationEngine } from './simulationEngine';

export class DeviceService {
  /**
   * Subscribe to device status (online, motor running, emergency stop, etc.)
   */
  public subscribeToDeviceStatus(
    deviceId: string,
    isDemoMode: boolean,
    onStatus: (status: DeviceStatus) => void
  ): () => void {
    if (isDemoMode || !isFirebaseConfigured || !rtdb) {
      return simulationEngine.subscribe((_tel, dev) => {
        onStatus(dev);
      });
    }

    const statusRef = ref(rtdb, `devices/${deviceId}/status`);
    const callback = (snapshot: any) => {
      const data = snapshot.val() || {};
      const status: DeviceStatus = {
        online: Boolean(data.online),
        lastSeen: typeof data.lastSeen === 'number' ? data.lastSeen : Date.now(),
        motorRunning: Boolean(data.motorRunning),
        motorState: data.motorState || (data.motorRunning ? 'RUNNING' : 'STOPPED'),
        emergencyStop: Boolean(data.emergencyStop),
        emergencyReason: data.emergencyReason,
        firmwareVersion: data.firmwareVersion || 'v1.0.0-ESP32',
        uptimeSeconds: typeof data.uptimeSeconds === 'number' ? data.uptimeSeconds : 0,
        wifiSSID: data.wifiSSID,
        wifiRSSI: data.wifiRSSI,
        ipAddress: data.ipAddress,
      };
      onStatus(status);
    };

    onValue(statusRef, callback);
    return () => off(statusRef, 'value', callback);
  }

  /**
   * Subscribe to sensor states
   */
  public subscribeToSensors(
    deviceId: string,
    isDemoMode: boolean,
    onSensors: (sensors: SensorStatus) => void
  ): () => void {
    if (isDemoMode || !isFirebaseConfigured || !rtdb) {
      return simulationEngine.subscribe((_tel, _dev, sensors) => {
        onSensors(sensors);
      });
    }

    const sensorsRef = ref(rtdb, `devices/${deviceId}/sensors`);
    const callback = (snapshot: any) => {
      const data = snapshot.val() || {};
      const sensors: SensorStatus = {
        hallSensor: data.hallSensor || 'UNKNOWN',
        mpu6050: data.mpu6050 || 'UNKNOWN',
        currentSensor: data.currentSensor || 'UNKNOWN',
        esp32: data.esp32 || 'UNKNOWN',
        wifi: data.wifi || 'UNKNOWN',
        firebase: 'CONNECTED',
        lastUpdated: typeof data.lastUpdated === 'number' ? data.lastUpdated : Date.now(),
      };
      onSensors(sensors);
    };

    onValue(sensorsRef, callback);
    return () => off(sensorsRef, 'value', callback);
  }

  /**
   * Subscribe to threshold configurations
   */
  public subscribeToThresholds(
    deviceId: string,
    onThresholds: (thresholds: ThresholdConfiguration) => void
  ): () => void {
    if (!isFirebaseConfigured || !rtdb) {
      onThresholds(DEFAULT_THRESHOLDS);
      return () => {};
    }

    const threshRef = ref(rtdb, `devices/${deviceId}/thresholds`);
    const callback = (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        onThresholds({
          minRPM: data.minRPM ?? DEFAULT_THRESHOLDS.minRPM,
          maxRPM: data.maxRPM ?? DEFAULT_THRESHOLDS.maxRPM,
          warnRPM: data.warnRPM ?? DEFAULT_THRESHOLDS.warnRPM,
          maxCurrent: data.maxCurrent ?? DEFAULT_THRESHOLDS.maxCurrent,
          warnCurrent: data.warnCurrent ?? DEFAULT_THRESHOLDS.warnCurrent,
          maxVibration: data.maxVibration ?? DEFAULT_THRESHOLDS.maxVibration,
          warnVibration: data.warnVibration ?? DEFAULT_THRESHOLDS.warnVibration,
          staleTimeoutMs: data.staleTimeoutMs ?? DEFAULT_THRESHOLDS.staleTimeoutMs,
        });
      } else {
        onThresholds(DEFAULT_THRESHOLDS);
      }
    };

    onValue(threshRef, callback);
    return () => off(threshRef, 'value', callback);
  }

  /**
   * Update thresholds in Firebase
   */
  public async updateThresholds(
    deviceId: string,
    thresholds: Partial<ThresholdConfiguration>
  ): Promise<void> {
    if (!isFirebaseConfigured || !rtdb) return;
    const threshRef = ref(rtdb, `devices/${deviceId}/thresholds`);
    await update(threshRef, thresholds);
  }

  /**
   * Dispatch mobile control commands to ESP32
   * Note: The ESP32 evaluates these, but maintains its autonomous safety cutoff
   */
  public async sendControlCommand(
    deviceId: string,
    control: Partial<DeviceControl>,
    isDemoMode: boolean
  ): Promise<void> {
    if (isDemoMode) {
      if (control.emergencyStop) {
        simulationEngine.setPhase('AUTOMATIC_ABORT');
      } else if (control.motorEnabled && control.armed) {
        simulationEngine.setPhase('IGNITION');
      } else if (control.motorEnabled === false) {
        simulationEngine.setPhase('MOTOR_STOPPED');
      } else if (control.resetFaults) {
        simulationEngine.reset('PRE_LAUNCH');
      }
      return;
    }

    if (!isFirebaseConfigured || !rtdb) return;
    const controlRef = ref(rtdb, `devices/${deviceId}/control`);
    await update(controlRef, {
      ...control,
      updatedAt: Date.now(),
    });
  }
}

export const deviceService = new DeviceService();
