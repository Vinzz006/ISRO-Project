import { TelemetryData } from '../types/telemetry';

export function sanitizeTelemetry(raw: unknown): TelemetryData {
  const fallback: TelemetryData = {
    rpm: 0,
    current: 0,
    vibration: 0,
    acceleration: { x: 0, y: 0, z: 1.0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    motorPWM: 0,
    timestamp: Date.now(),
  };

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const data = raw as Record<string, unknown>;

  const sanitizeNumber = (val: unknown, min: number, max: number, defaultVal: number): number => {
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return Math.max(min, Math.min(max, val));
    }
    return defaultVal;
  };

  const accel = (typeof data.acceleration === 'object' && data.acceleration !== null)
    ? (data.acceleration as Record<string, unknown>)
    : {};

  const gyro = (typeof data.gyroscope === 'object' && data.gyroscope !== null)
    ? (data.gyroscope as Record<string, unknown>)
    : {};

  return {
    rpm: sanitizeNumber(data.rpm, 0, 15000, 0),
    current: sanitizeNumber(data.current, 0, 25, 0),
    vibration: sanitizeNumber(data.vibration, 0, 10, 0),
    acceleration: {
      x: sanitizeNumber(accel.x, -16, 16, 0),
      y: sanitizeNumber(accel.y, -16, 16, 0),
      z: sanitizeNumber(accel.z, -16, 16, 1.0),
    },
    gyroscope: {
      x: sanitizeNumber(gyro.x, -2000, 2000, 0),
      y: sanitizeNumber(gyro.y, -2000, 2000, 0),
      z: sanitizeNumber(gyro.z, -2000, 2000, 0),
    },
    motorPWM: sanitizeNumber(data.motorPWM, 0, 255, 0),
    timestamp: typeof data.timestamp === 'number' && data.timestamp > 0 ? data.timestamp : Date.now(),
  };
}
