export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface TelemetryData {
  rpm: number;
  current: number;       // in Amperes (A)
  vibration: number;     // in g or magnitude
  acceleration: Vector3D; // in g
  gyroscope: Vector3D;    // in deg/s or rad/s
  motorPWM: number;      // 0 - 255
  timestamp: number;     // Epoch in milliseconds
}

export type HealthSeverity = 'NOMINAL' | 'WARNING' | 'CRITICAL';

export interface HealthStatus {
  score: number;             // 0 to 100
  overallStatus: HealthSeverity;
  rpmStatus: HealthSeverity;
  currentStatus: HealthSeverity;
  vibrationStatus: HealthSeverity;
  systemStatus: HealthSeverity;
  lastEvaluated: number;
  reasons: string[];
}

export interface ThresholdConfiguration {
  minRPM: number;            // e.g. 500
  maxRPM: number;            // e.g. 3500
  warnRPM: number;           // e.g. 3000
  maxCurrent: number;        // e.g. 1.8 A
  warnCurrent: number;       // e.g. 1.3 A
  maxVibration: number;      // e.g. 0.35 g
  warnVibration: number;     // e.g. 0.18 g
  staleTimeoutMs: number;    // e.g. 3500 ms (threshold to mark telemetry as stale/offline)
}

export type TimeWindow = '30s' | '1m' | '5m' | '15m';

export interface TelemetryHistoryPoint {
  timestamp: number;
  rpm: number;
  current: number;
  vibration: number;
  motorPWM: number;
}
