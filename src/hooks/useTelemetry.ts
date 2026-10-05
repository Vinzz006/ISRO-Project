import { useMission } from '../context/MissionContext';

export function useTelemetry() {
  const {
    telemetry,
    telemetryHistory,
    thresholds,
    health,
    isDemoMode,
  } = useMission();

  return {
    telemetry,
    history: telemetryHistory,
    thresholds,
    health,
    isDemoMode,
  };
}
