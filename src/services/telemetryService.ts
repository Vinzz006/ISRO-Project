import { ref, onValue, off, query, limitToLast } from 'firebase/database';
import { rtdb, isFirebaseConfigured } from './firebase';
import { TelemetryData, TelemetryHistoryPoint } from '../types/telemetry';
import { sanitizeTelemetry } from '../utils/validation';
import { simulationEngine } from './simulationEngine';

export type TelemetryListener = (telemetry: TelemetryData) => void;

class TelemetryService {
  private activeListeners: Map<string, TelemetryListener[]> = new Map();
  private firebaseRefs: Map<string, any> = new Map();

  /**
   * Subscribe to real-time telemetry updates for a given device.
   * If isDemoMode is true, routes to the local simulation engine.
   */
  public subscribeToTelemetry(
    deviceId: string,
    isDemoMode: boolean,
    onData: TelemetryListener
  ): () => void {
    if (isDemoMode || !isFirebaseConfigured || !rtdb) {
      // Demo simulation subscription
      const unsub = simulationEngine.subscribe((telemetry) => {
        onData(telemetry);
      });
      return unsub;
    }

    // Live Firebase Realtime Database subscription
    const telemetryPath = `devices/${deviceId}/telemetry`;
    const telemetryRef = ref(rtdb, telemetryPath);

    if (!this.activeListeners.has(deviceId)) {
      this.activeListeners.set(deviceId, []);
    }
    this.activeListeners.get(deviceId)!.push(onData);

    const onValueCallback = (snapshot: any) => {
      const raw = snapshot.val();
      const sanitized = sanitizeTelemetry(raw);
      const listeners = this.activeListeners.get(deviceId) || [];
      for (const listener of listeners) {
        listener(sanitized);
      }
    };

    onValue(telemetryRef, onValueCallback, (error) => {
      console.error(`[TelemetryService] Firebase RTDB read error at ${telemetryPath}:`, error);
    });

    this.firebaseRefs.set(deviceId, { ref: telemetryRef, callback: onValueCallback });

    // Return cleanup / unsubscribe function
    return () => {
      const listeners = this.activeListeners.get(deviceId) || [];
      const index = listeners.indexOf(onData);
      if (index !== -1) {
        listeners.splice(index, 1);
      }

      if (listeners.length === 0) {
        const stored = this.firebaseRefs.get(deviceId);
        if (stored && rtdb) {
          off(stored.ref, 'value', stored.callback);
          this.firebaseRefs.delete(deviceId);
        }
        this.activeListeners.delete(deviceId);
      }
    };
  }

  /**
   * Fetch recent telemetry history points for charting
   */
  public async fetchHistoricalTelemetry(
    deviceId: string,
    pointsLimit: number = 60
  ): Promise<TelemetryHistoryPoint[]> {
    if (!isFirebaseConfigured || !rtdb) {
      return [];
    }

    try {
      const historyPath = `devices/${deviceId}/history`;
      const historyQuery = query(ref(rtdb, historyPath), limitToLast(pointsLimit));

      // In real-time database, we can read with a one-time listener or get
      const { get } = await import('firebase/database');
      const snapshot = await get(historyQuery);

      if (!snapshot.exists()) {
        return [];
      }

      const rawVal = snapshot.val();
      const points: TelemetryHistoryPoint[] = [];

      for (const key of Object.keys(rawVal)) {
        const item = rawVal[key];
        if (item && typeof item === 'object') {
          points.push({
            timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
            rpm: typeof item.rpm === 'number' ? item.rpm : 0,
            current: typeof item.current === 'number' ? item.current : 0,
            vibration: typeof item.vibration === 'number' ? item.vibration : 0,
            motorPWM: typeof item.motorPWM === 'number' ? item.motorPWM : 0,
          });
        }
      }

      return points.sort((a, b) => a.timestamp - b.timestamp);
    } catch (err) {
      console.warn('[TelemetryService] Failed to load historical telemetry:', err);
      return [];
    }
  }
}

export const telemetryService = new TelemetryService();
