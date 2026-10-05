export function formatRPM(rpm: number | undefined | null): string {
  if (rpm === undefined || rpm === null || isNaN(rpm)) return '---';
  return Math.round(rpm).toLocaleString();
}

export function formatCurrent(amperes: number | undefined | null): string {
  if (amperes === undefined || amperes === null || isNaN(amperes)) return '---';
  return amperes.toFixed(2);
}

export function formatVibration(vibration: number | undefined | null): string {
  if (vibration === undefined || vibration === null || isNaN(vibration)) return '---';
  return vibration.toFixed(3);
}

export function formatAxis(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  const prefix = val >= 0 ? '+' : '';
  return prefix + val.toFixed(2);
}

export function formatTimestamp(timestamp: number | undefined | null): string {
  if (!timestamp || isNaN(timestamp)) return '---';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function formatDateTime(timestamp: number | undefined | null): string {
  if (!timestamp || isNaN(timestamp)) return '---';
  const date = new Date(timestamp);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

export function formatUptime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
