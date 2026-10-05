/**
 * ==============================================================================
 * LAUNCH VEHICLE PROPULSION HEALTH SCORING ALGORITHM
 * ==============================================================================
 *
 * Algorithm Description:
 * Base Score = 100 points (Fully nominal launch state)
 *
 * Deductions applied dynamically:
 * 1. Emergency Shutdown Active: -60 points (immediate critical drop)
 * 2. Device Offline / Telemetry Stale: -50 points
 * 3. Overcurrent:
 *    - Critical (current >= maxCurrent): -35 points
 *    - Warning (current >= warnCurrent): -15 points
 * 4. Excessive Vibration:
 *    - Critical (vibration >= maxVibration): -30 points
 *    - Warning (vibration >= warnVibration): -12 points
 * 5. RPM Deviations (when motor is running):
 *    - Critical Overspeed (rpm > maxRPM): -30 points
 *    - Warning High RPM (rpm > warnRPM): -10 points
 *    - Warning Underspeed / Stall (rpm < minRPM): -15 points
 * 6. Sensor Communication Anomalies:
 *    - For each offline or warning sensor: -10 points each
 * 7. Active Fault Penalties:
 *    - Critical fault present: -25 points
 *    - Warning fault present: -10 points
 *
 * Health Status Mapping:
 * - 85 - 100: NOMINAL (Green)
 * - 50 - 84:  WARNING (Amber)
 * - 0 - 49:   CRITICAL (Red)
 * ==============================================================================
 */

import { HealthSeverity, HealthStatus, TelemetryData, ThresholdConfiguration } from '../types/telemetry';
import { DeviceStatus, SensorStatus } from '../types/device';
import { FaultEvent } from '../types/faults';
import {
  evaluateCurrentSeverity,
  evaluateRPMSeverity,
  evaluateVibrationSeverity,
  isTelemetryStale,
} from './thresholds';

export interface HealthEvaluationInput {
  telemetry: TelemetryData;
  deviceStatus: DeviceStatus;
  sensors?: SensorStatus;
  thresholds: ThresholdConfiguration;
  activeFaults?: FaultEvent[];
}

export function calculateHealthScore(input: HealthEvaluationInput): HealthStatus {
  const { telemetry, deviceStatus, sensors, thresholds, activeFaults = [] } = input;

  let score = 100;
  const reasons: string[] = [];

  const stale = isTelemetryStale(telemetry.timestamp, thresholds.staleTimeoutMs);

  // 1. Connection / Stale Telemetry Check
  if (!deviceStatus.online || stale) {
    score -= 50;
    reasons.push(stale ? 'Telemetry stream is stale' : 'ESP32 controller is offline');
  }

  // 2. Emergency Shutdown Check
  if (deviceStatus.emergencyStop) {
    score -= 60;
    reasons.push(`Emergency cutoff engaged${deviceStatus.emergencyReason ? ': ' + deviceStatus.emergencyReason : ''}`);
  }

  // 3. Current Severity
  const currentSeverity = evaluateCurrentSeverity(telemetry.current, thresholds);
  if (currentSeverity === 'CRITICAL') {
    score -= 35;
    reasons.push(`Critical motor overcurrent detected (${telemetry.current.toFixed(2)} A)`);
  } else if (currentSeverity === 'WARNING') {
    score -= 15;
    reasons.push(`Elevated motor current (${telemetry.current.toFixed(2)} A)`);
  }

  // 4. Vibration Severity
  const vibrationSeverity = evaluateVibrationSeverity(telemetry.vibration, thresholds);
  if (vibrationSeverity === 'CRITICAL') {
    score -= 30;
    reasons.push(`Critical structural vibration anomaly (${telemetry.vibration.toFixed(3)} g)`);
  } else if (vibrationSeverity === 'WARNING') {
    score -= 12;
    reasons.push(`Elevated vibration levels (${telemetry.vibration.toFixed(3)} g)`);
  }

  // 5. RPM Severity
  const rpmSeverity = evaluateRPMSeverity(telemetry.rpm, deviceStatus.motorRunning, thresholds);
  if (rpmSeverity === 'CRITICAL') {
    score -= 30;
    reasons.push(`Motor overspeed limit breached (${Math.round(telemetry.rpm)} RPM)`);
  } else if (rpmSeverity === 'WARNING') {
    if (deviceStatus.motorRunning && telemetry.rpm < thresholds.minRPM) {
      score -= 15;
      reasons.push(`Propulsion underspeed / stall condition (${Math.round(telemetry.rpm)} RPM)`);
    } else {
      score -= 10;
      reasons.push(`RPM elevated above warning threshold (${Math.round(telemetry.rpm)} RPM)`);
    }
  }

  // 6. Sensor Health Deductions
  if (sensors) {
    const sensorEntries = [
      { name: 'Hall Effect Sensor', state: sensors.hallSensor },
      { name: 'MPU6050 IMU', state: sensors.mpu6050 },
      { name: 'Current Sensor', state: sensors.currentSensor },
    ];

    for (const sensor of sensorEntries) {
      if (sensor.state === 'OFFLINE' || sensor.state === 'UNKNOWN') {
        score -= 12;
        reasons.push(`${sensor.name} telemetry lost`);
      } else if (sensor.state === 'WARNING') {
        score -= 6;
        reasons.push(`${sensor.name} reporting abnormal values`);
      }
    }
  }

  // 7. Active Faults Deduction
  const hasCriticalFault = activeFaults.some(f => f.severity === 'CRITICAL');
  const hasWarningFault = activeFaults.some(f => f.severity === 'WARNING');

  if (hasCriticalFault) {
    score -= 20;
  } else if (hasWarningFault) {
    score -= 10;
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // Derive Overall Health Status
  let overallStatus: HealthSeverity = 'NOMINAL';
  if (finalScore < 50 || deviceStatus.emergencyStop || currentSeverity === 'CRITICAL' || vibrationSeverity === 'CRITICAL' || rpmSeverity === 'CRITICAL') {
    overallStatus = 'CRITICAL';
  } else if (finalScore < 85 || currentSeverity === 'WARNING' || vibrationSeverity === 'WARNING' || rpmSeverity === 'WARNING') {
    overallStatus = 'WARNING';
  }

  return {
    score: finalScore,
    overallStatus,
    rpmStatus: rpmSeverity,
    currentStatus: currentSeverity,
    vibrationStatus: vibrationSeverity,
    systemStatus: overallStatus,
    lastEvaluated: Date.now(),
    reasons,
  };
}
