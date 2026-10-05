import { ThresholdConfiguration } from '../types/telemetry';

export const DEFAULT_DEVICE_ID = 'DEVICE-001';

export const AVAILABLE_DEVICES = [
  { id: 'DEVICE-001', name: 'Stage-1 Main Propulsion (PS1 Sim)' },
  { id: 'DEVICE-002', name: 'Stage-2 Liquid Engine (Vikas Sim)' },
  { id: 'DEVICE-003', name: 'Cryogenic Upper Stage (CUS Sim)' },
];

export const DEFAULT_THRESHOLDS: ThresholdConfiguration = {
  minRPM: 600,
  maxRPM: 3500,
  warnRPM: 3100,
  maxCurrent: 1.8,     // Amperes
  warnCurrent: 1.35,   // Amperes
  maxVibration: 0.35,  // g RMS
  warnVibration: 0.18, // g RMS
  staleTimeoutMs: 4000 // 4 seconds before marking telemetry stale
};

export const APP_CONFIG = {
  appName: 'Launch Vehicle Health Monitor',
  subtitle: 'Propulsion Telemetry & Safety System',
  disclaimer: 'Educational prototype inspired by launch-vehicle propulsion health monitoring. Not affiliated with operational ISRO flight computers.',
  version: '1.0.0-PROTOTYPE',
  telemetryHistoryMaxPoints: 120, // Max in-memory points for graphing
  defaultGraphWindow: '1m',
};
