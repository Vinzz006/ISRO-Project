import { ref, onValue, off, push, set, query, limitToLast } from 'firebase/database';
import { rtdb, isFirebaseConfigured } from './firebase';
import { FaultEvent } from '../types/faults';
import { simulationEngine } from './simulationEngine';

export class FaultService {
  /**
   * Subscribe to active faults for a device
   */
  public subscribeToActiveFaults(
    deviceId: string,
    isDemoMode: boolean,
    onFaults: (faults: FaultEvent[]) => void
  ): () => void {
    if (isDemoMode || !isFirebaseConfigured || !rtdb) {
      return simulationEngine.subscribe((_tel, _dev, _sen, faults) => {
        onFaults(faults);
      });
    }

    const faultsRef = ref(rtdb, `devices/${deviceId}/faults`);
    const callback = (snapshot: any) => {
      const data = snapshot.val();
      if (!data) {
        onFaults([]);
        return;
      }

      const faultList: FaultEvent[] = [];
      if (Array.isArray(data)) {
        data.filter(Boolean).forEach((f, idx) => {
          faultList.push({ ...f, id: f.id || `f-${idx}` });
        });
      } else if (typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item) {
            faultList.push({ ...item, id: key });
          }
        });
      }

      onFaults(faultList.sort((a, b) => b.timestamp - a.timestamp));
    };

    onValue(faultsRef, callback);
    return () => off(faultsRef, 'value', callback);
  }

  /**
   * Subscribe to historical fault / system events
   */
  public subscribeToEvents(
    deviceId: string,
    isDemoMode: boolean,
    limit: number = 50,
    onEvents: (events: FaultEvent[]) => void
  ): () => void {
    if (isDemoMode || !isFirebaseConfigured || !rtdb) {
      return simulationEngine.subscribe((_tel, _dev, _sen, faults) => {
        // In demo mode, derive historical log from simulated faults
        onEvents(faults);
      });
    }

    const eventsRef = query(ref(rtdb, `devices/${deviceId}/events`), limitToLast(limit));
    const callback = (snapshot: any) => {
      const data = snapshot.val();
      if (!data) {
        onEvents([]);
        return;
      }

      const events: FaultEvent[] = [];
      Object.keys(data).forEach((key) => {
        const item = data[key];
        if (item) {
          events.push({ ...item, id: key });
        }
      });

      onEvents(events.sort((a, b) => b.timestamp - a.timestamp));
    };

    onValue(eventsRef, callback);
    return () => off(eventsRef, 'value', callback);
  }

  /**
   * Log a new fault event to Firebase
   */
  public async recordFaultEvent(deviceId: string, event: Omit<FaultEvent, 'id'>): Promise<void> {
    if (!isFirebaseConfigured || !rtdb) return;
    const eventsRef = ref(rtdb, `devices/${deviceId}/events`);
    const newRef = push(eventsRef);
    await set(newRef, {
      ...event,
      timestamp: Date.now(),
    });
  }

  /**
   * Acknowledge or clear an active fault
   */
  public async clearFault(deviceId: string, faultId: string): Promise<void> {
    if (!isFirebaseConfigured || !rtdb) return;
    const faultRef = ref(rtdb, `devices/${deviceId}/faults/${faultId}`);
    await set(faultRef, null);
  }
}

export const faultService = new FaultService();
