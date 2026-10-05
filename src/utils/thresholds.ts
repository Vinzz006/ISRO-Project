import { HealthSeverity, ThresholdConfiguration } from '../types/telemetry';

export function evaluateRPMSeverity(
  rpm: number,
  motorRunning: boolean,
  thresholds: ThresholdConfiguration
): HealthSeverity {
  if (!motorRunning) {
    return rpm > 50 ? 'WARNING' : 'NOMINAL';
  }

  if (rpm > thresholds.maxRPM) return 'CRITICAL';
  if (rpm > thresholds.warnRPM) return 'WARNING';
  if (rpm < thresholds.minRPM && motorRunning) return 'WARNING'; // under-speed or stalled

  return 'NOMINAL';
}

export function evaluateCurrentSeverity(
  current: number,
  thresholds: ThresholdConfiguration
): HealthSeverity {
  if (current >= thresholds.maxCurrent) return 'CRITICAL';
  if (current >= thresholds.warnCurrent) return 'WARNING';
  return 'NOMINAL';
}

export function evaluateVibrationSeverity(
  vibration: number,
  thresholds: ThresholdConfiguration
): HealthSeverity {
  if (vibration >= thresholds.maxVibration) return 'CRITICAL';
  if (vibration >= thresholds.warnVibration) return 'WARNING';
  return 'NOMINAL';
}

export function isTelemetryStale(
  lastSeenTimestamp: number,
  staleTimeoutMs: number
): boolean {
  if (!lastSeenTimestamp) return true;
  return Date.now() - lastSeenTimestamp > staleTimeoutMs;
}
