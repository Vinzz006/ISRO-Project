import { HealthSeverity } from './telemetry';

export type FaultType =
  | 'OVER_CURRENT'
  | 'OVERSPEED'
  | 'LOW_RPM'
  | 'HIGH_VIBRATION'
  | 'SENSOR_FAILURE'
  | 'CONNECTION_LOST'
  | 'EMERGENCY_SHUTDOWN'
  | 'THERMAL_WARNING'
  | 'COMMUNICATION_TIMEOUT'
  | 'MANUAL_ABORT';

export interface TelemetrySnapshot {
  rpm: number;
  current: number;
  vibration: number;
  pwm: number;
  timestamp: number;
}

export interface FaultEvent {
  id: string;
  deviceId: string;
  type: FaultType;
  severity: HealthSeverity;
  message: string;
  timestamp: number;
  acknowledged?: boolean;
  clearedAt?: number;
  snapshot?: TelemetrySnapshot;
}

export interface FaultFilter {
  severity?: HealthSeverity | 'ALL';
  type?: FaultType | 'ALL';
}
