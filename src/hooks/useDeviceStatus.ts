import { useMission } from '../context/MissionContext';
import { isTelemetryStale } from '../utils/thresholds';

export function useDeviceStatus() {
  const {
    deviceId,
    setDeviceId,
    deviceStatus,
    sensors,
    thresholds,
    isDemoMode,
    setDemoMode,
    isFirebaseAvailable,
    armSystem,
    startMotor,
    stopMotor,
    emergencyShutdown,
    resetFaults,
  } = useMission();

  const isStale = isTelemetryStale(deviceStatus.lastSeen, thresholds.staleTimeoutMs);
  const isOnline = deviceStatus.online && !isStale;

  return {
    deviceId,
    setDeviceId,
    deviceStatus,
    sensors,
    isOnline,
    isStale,
    isDemoMode,
    setDemoMode,
    isFirebaseAvailable,
    armSystem,
    startMotor,
    stopMotor,
    emergencyShutdown,
    resetFaults,
  };
}
