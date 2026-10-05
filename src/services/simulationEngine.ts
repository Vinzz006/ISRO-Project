import { TelemetryData } from '../types/telemetry';
import { DeviceStatus, SensorStatus } from '../types/device';
import { FaultEvent, FaultType } from '../types/faults';

export type LaunchPhase =
  | 'PRE_LAUNCH'
  | 'IGNITION'
  | 'RPM_RISING'
  | 'NOMINAL_OPERATION'
  | 'ANOMALY'
  | 'FAULT_DETECTED'
  | 'AUTOMATIC_ABORT'
  | 'MOTOR_STOPPED';

export interface SimulationState {
  phase: LaunchPhase;
  phaseElapsedSeconds: number;
  totalElapsedSeconds: number;
  anomalyType: FaultType;
  autoAdvance: boolean;
}

export type SimulationListener = (
  telemetry: TelemetryData,
  deviceStatus: DeviceStatus,
  sensors: SensorStatus,
  activeFaults: FaultEvent[],
  state: SimulationState
) => void;

class SimulationEngine {
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<SimulationListener> = new Set();

  private state: SimulationState = {
    phase: 'PRE_LAUNCH',
    phaseElapsedSeconds: 0,
    totalElapsedSeconds: 0,
    anomalyType: 'OVER_CURRENT',
    autoAdvance: true,
  };

  private currentRpm = 0;
  private targetRpm = 0;
  private motorCurrent = 0;
  private vibration = 0.04;
  private motorPwm = 0;
  private activeFaults: FaultEvent[] = [];

  constructor() {
    this.reset();
  }

  public reset(phase: LaunchPhase = 'PRE_LAUNCH') {
    this.state = {
      phase,
      phaseElapsedSeconds: 0,
      totalElapsedSeconds: 0,
      anomalyType: 'OVER_CURRENT',
      autoAdvance: true,
    };
    this.currentRpm = 0;
    this.targetRpm = 0;
    this.motorCurrent = 0.0;
    this.vibration = 0.035;
    this.motorPwm = 0;
    this.activeFaults = [];
    this.notify();
  }

  public start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 500); // 2Hz updates for responsive telemetry
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public setPhase(phase: LaunchPhase) {
    this.state.phase = phase;
    this.state.phaseElapsedSeconds = 0;
    this.applyPhaseParameters(phase);
    this.notify();
  }

  public setAnomalyType(type: FaultType) {
    this.state.anomalyType = type;
  }

  public toggleAutoAdvance(enabled: boolean) {
    this.state.autoAdvance = enabled;
  }

  public subscribe(listener: SimulationListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial state
    listener(this.generateTelemetry(), this.generateDeviceStatus(), this.generateSensors(), this.activeFaults, this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private applyPhaseParameters(phase: LaunchPhase) {
    switch (phase) {
      case 'PRE_LAUNCH':
        this.targetRpm = 0;
        this.motorPwm = 0;
        this.activeFaults = [];
        break;
      case 'IGNITION':
        this.targetRpm = 800;
        this.motorPwm = 65;
        this.activeFaults = [];
        break;
      case 'RPM_RISING':
        this.targetRpm = 2400;
        this.motorPwm = 175;
        this.activeFaults = [];
        break;
      case 'NOMINAL_OPERATION':
        this.targetRpm = 2500;
        this.motorPwm = 180;
        this.activeFaults = [];
        break;
      case 'ANOMALY':
        if (this.state.anomalyType === 'OVER_CURRENT') {
          this.targetRpm = 2100;
          this.motorCurrent = 1.95; // Exceeds 1.8A max
        } else if (this.state.anomalyType === 'HIGH_VIBRATION') {
          this.targetRpm = 2800;
          this.vibration = 0.45;   // Exceeds 0.35g max
        } else if (this.state.anomalyType === 'OVERSPEED') {
          this.targetRpm = 3700;   // Exceeds 3500 max
          this.motorPwm = 255;
        }
        break;
      case 'FAULT_DETECTED':
        // Generate the critical fault event
        this.triggerAnomalyFault();
        break;
      case 'AUTOMATIC_ABORT':
      case 'MOTOR_STOPPED':
        this.targetRpm = 0;
        this.motorPwm = 0;
        break;
    }
  }

  private triggerAnomalyFault() {
    let message = 'Automatic emergency cutoff initiated by edge controller.';
    let faultType: FaultType = this.state.anomalyType;

    if (faultType === 'OVER_CURRENT') {
      message = 'Motor overload: Overcurrent limit (1.80 A) exceeded. Primary edge cutoff engaged.';
    } else if (faultType === 'HIGH_VIBRATION') {
      message = 'Excessive structural vibration (0.450 g) detected on gimbal mount.';
    } else if (faultType === 'OVERSPEED') {
      message = 'Motor speed exceeded maximum safety limit (3500 RPM). Over-rev cutoff.';
    }

    const fault: FaultEvent = {
      id: `FAULT-SIM-${Date.now()}`,
      deviceId: 'DEVICE-001',
      type: faultType,
      severity: 'CRITICAL',
      message,
      timestamp: Date.now(),
      snapshot: {
        rpm: Math.round(this.currentRpm),
        current: Number(this.motorCurrent.toFixed(2)),
        vibration: Number(this.vibration.toFixed(3)),
        pwm: this.motorPwm,
        timestamp: Date.now(),
      },
    };

    if (!this.activeFaults.some(f => f.type === faultType)) {
      this.activeFaults = [fault, ...this.activeFaults];
    }
  }

  private tick() {
    this.state.totalElapsedSeconds += 0.5;
    this.state.phaseElapsedSeconds += 0.5;

    // Phase automatic progression logic
    if (this.state.autoAdvance) {
      const elapsed = this.state.phaseElapsedSeconds;
      if (this.state.phase === 'PRE_LAUNCH' && elapsed >= 4) {
        this.setPhase('IGNITION');
      } else if (this.state.phase === 'IGNITION' && elapsed >= 3) {
        this.setPhase('RPM_RISING');
      } else if (this.state.phase === 'RPM_RISING' && elapsed >= 5) {
        this.setPhase('NOMINAL_OPERATION');
      } else if (this.state.phase === 'NOMINAL_OPERATION' && elapsed >= 7) {
        this.setPhase('ANOMALY');
      } else if (this.state.phase === 'ANOMALY' && elapsed >= 3) {
        this.setPhase('FAULT_DETECTED');
      } else if (this.state.phase === 'FAULT_DETECTED' && elapsed >= 2.5) {
        this.setPhase('AUTOMATIC_ABORT');
      } else if (this.state.phase === 'AUTOMATIC_ABORT' && elapsed >= 3) {
        this.setPhase('MOTOR_STOPPED');
      }
    }

    // Smooth RPM approach with noise
    const delta = (this.targetRpm - this.currentRpm) * 0.25;
    this.currentRpm += delta;
    const noise = (Math.random() - 0.5) * (this.currentRpm > 100 ? 25 : 2);
    this.currentRpm = Math.max(0, this.currentRpm + noise);

    // Calculate physical correlation for current and vibration
    if (this.state.phase === 'ANOMALY' || this.state.phase === 'FAULT_DETECTED') {
      if (this.state.anomalyType === 'OVER_CURRENT') {
        this.motorCurrent = 2.15 + (Math.random() - 0.5) * 0.15;
      } else if (this.state.anomalyType === 'HIGH_VIBRATION') {
        this.vibration = 0.42 + (Math.random() - 0.5) * 0.08;
        this.motorCurrent = 1.1 + (Math.random() - 0.5) * 0.05;
      }
    } else if (this.state.phase === 'AUTOMATIC_ABORT' || this.state.phase === 'MOTOR_STOPPED') {
      this.motorCurrent = Math.max(0, this.motorCurrent * 0.6);
      this.vibration = 0.03 + (Math.random() - 0.5) * 0.01;
    } else {
      // Normal physics: current is proportional to RPM and PWM load
      const baseCurrent = this.currentRpm > 50 ? 0.35 + (this.currentRpm / 3000) * 0.55 : 0.05;
      this.motorCurrent = baseCurrent + (Math.random() - 0.5) * 0.04;
      const baseVib = this.currentRpm > 50 ? 0.04 + (this.currentRpm / 3000) * 0.05 : 0.02;
      this.vibration = baseVib + (Math.random() - 0.5) * 0.01;
    }

    this.notify();
  }

  private generateTelemetry(): TelemetryData {
    const isRunning = this.currentRpm > 50;
    const vibNoise = (Math.random() - 0.5) * (isRunning ? 0.04 : 0.005);

    // Thrust acceleration: 1.0g gravity + dynamic acceleration
    const thrustG = isRunning ? (this.currentRpm / 2500) * 1.5 : 0;
    const accelZ = 1.0 + thrustG + (Math.random() - 0.5) * 0.05;
    const accelX = (Math.random() - 0.5) * (isRunning ? 0.12 : 0.02);
    const accelY = (Math.random() - 0.5) * (isRunning ? 0.12 : 0.02);

    const gyroX = (Math.random() - 0.5) * (isRunning ? 2.5 : 0.2);
    const gyroY = (Math.random() - 0.5) * (isRunning ? 2.5 : 0.2);
    const gyroZ = (Math.random() - 0.5) * (isRunning ? 4.0 : 0.1);

    return {
      rpm: Math.round(this.currentRpm),
      current: Number(Math.max(0, this.motorCurrent).toFixed(2)),
      vibration: Number(Math.max(0, this.vibration + vibNoise).toFixed(3)),
      acceleration: {
        x: Number(accelX.toFixed(2)),
        y: Number(accelY.toFixed(2)),
        z: Number(accelZ.toFixed(2)),
      },
      gyroscope: {
        x: Number(gyroX.toFixed(2)),
        y: Number(gyroY.toFixed(2)),
        z: Number(gyroZ.toFixed(2)),
      },
      motorPWM: this.motorPwm,
      timestamp: Date.now(),
    };
  }

  private generateDeviceStatus(): DeviceStatus {
    const isAborted = this.state.phase === 'AUTOMATIC_ABORT' || this.state.phase === 'MOTOR_STOPPED';
    const isRunning = this.currentRpm > 50 && !isAborted;

    return {
      online: true,
      lastSeen: Date.now(),
      motorRunning: isRunning,
      motorState: isAborted
        ? 'FAULT_LOCKOUT'
        : isRunning
        ? 'RUNNING'
        : this.state.phase === 'IGNITION'
        ? 'STARTING'
        : 'STOPPED',
      emergencyStop: isAborted,
      emergencyReason: isAborted ? this.activeFaults[0]?.message || 'CRITICAL SAFETY CUTOFF' : undefined,
      firmwareVersion: 'v1.0.4-ESP32-CORE',
      uptimeSeconds: Math.floor(this.state.totalElapsedSeconds) + 420,
      wifiSSID: 'MISSION_CONTROL_5G',
      wifiRSSI: -52,
      ipAddress: '192.168.1.144',
    };
  }

  private generateSensors(): SensorStatus {
    return {
      hallSensor: 'CONNECTED',
      mpu6050: 'CONNECTED',
      currentSensor: 'CONNECTED',
      esp32: 'CONNECTED',
      wifi: 'CONNECTED',
      firebase: 'CONNECTED',
      lastUpdated: Date.now(),
    };
  }

  private notify() {
    const tel = this.generateTelemetry();
    const dev = this.generateDeviceStatus();
    const sen = this.generateSensors();

    for (const listener of this.listeners) {
      try {
        listener(tel, dev, sen, this.activeFaults, this.state);
      } catch (err) {
        console.error('[SimulationEngine] Listener error:', err);
      }
    }
  }
}

export const simulationEngine = new SimulationEngine();
