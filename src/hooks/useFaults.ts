import { useMission } from '../context/MissionContext';
import { HealthSeverity } from '../types/telemetry';

export function useFaults(filterSeverity?: HealthSeverity | 'ALL') {
  const {
    activeFaults,
    faultHistory,
    resetFaults,
    isDemoMode,
  } = useMission();

  const filteredHistory = filterSeverity && filterSeverity !== 'ALL'
    ? faultHistory.filter(f => f.severity === filterSeverity)
    : faultHistory;

  const hasCriticalFault = activeFaults.some(f => f.severity === 'CRITICAL');
  const hasWarningFault = activeFaults.some(f => f.severity === 'WARNING');

  return {
    activeFaults,
    faultHistory: filteredHistory,
    hasCriticalFault,
    hasWarningFault,
    resetFaults,
    isDemoMode,
  };
}
