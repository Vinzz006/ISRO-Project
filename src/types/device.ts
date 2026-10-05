export type SensorState = 'CONNECTED' | 'WARNING' | 'OFFLINE' | 'UNKNOWN';

export interface SensorStatus {
  hallSensor: SensorState;
  mpu6050: SensorState;
  currentSensor: SensorState;
  esp32: SensorState;
  wifi: SensorState;
  firebase: SensorState;
  lastUpdated: number;
}

export type MotorRunState = 'STOPPED' | 'STARTING' | 'RUNNING' | 'BRAKING' | 'FAULT_LOCKOUT';

export interface DeviceStatus {
  online: boolean;
  lastSeen: number;
  motorRunning: boolean;
  motorState: MotorRunState;
  emergencyStop: boolean;
  emergencyReason?: string;
  firmwareVersion: string;
  uptimeSeconds: number;
  wifiSSID?: string;
  wifiRSSI?: number; // dBm
  ipAddress?: string;
}

export interface DeviceControl {
  armed: boolean;
  motorEnabled: boolean;
  targetRPM: number;
  emergencyStop: boolean;
  resetFaults: boolean;
  updatedAt: number;
}

export interface Device {
  id: string;
  name: string;
  description: string;
  status: DeviceStatus;
  sensors: SensorStatus;
  control: DeviceControl;
}
