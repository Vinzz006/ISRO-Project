/**
 * Firebase Realtime Database Hardware Telemetry Publisher Simulator
 * Use this script to test live cloud telemetry streaming to your dashboard!
 * Run: node scripts/test-firebase-publisher.js
 */

const https = require('https');

const DATABASE_URL = 'https://isro-project-9f447-default-rtdb.firebaseio.com';
const DEVICE_ID = 'DEVICE-001';

console.log('===============================================================');
console.log('🚀 SIMULATING ESP32 EDGE TELEMETRY -> FIREBASE REALTIME DB');
console.log(`📡 Target Database: ${DATABASE_URL}`);
console.log(`🛰 Device ID:       ${DEVICE_ID}`);
console.log('===============================================================\n');

let rpm = 2450;
let current = 0.82;
let vibration = 0.065;
let pwm = 180;
let tick = 0;

function publishPacket() {
  tick++;

  // Add realistic physical sensor fluctuation
  rpm = Math.max(0, Math.round(2450 + (Math.random() - 0.5) * 45));
  current = Number(Math.max(0, 0.82 + (Math.random() - 0.5) * 0.06).toFixed(2));
  vibration = Number(Math.max(0, 0.065 + (Math.random() - 0.5) * 0.015).toFixed(3));

  const now = Date.now();

  const payload = {
    status: {
      online: true,
      lastSeen: now,
      motorRunning: true,
      motorState: 'RUNNING',
      emergencyStop: false,
      emergencyReason: '',
      firmwareVersion: 'v1.0.4-ESP32-HARDWARE',
      uptimeSeconds: tick * 2 + 120,
      wifiSSID: 'MISSION_CONTROL_WIFI',
      wifiRSSI: -48,
      ipAddress: '192.168.1.105',
    },
    telemetry: {
      rpm,
      current,
      vibration,
      acceleration: {
        x: Number(((Math.random() - 0.5) * 0.05).toFixed(2)),
        y: Number(((Math.random() - 0.5) * 0.05).toFixed(2)),
        z: Number((1.02 + (Math.random() - 0.5) * 0.04).toFixed(2)),
      },
      gyroscope: {
        x: Number(((Math.random() - 0.5) * 1.5).toFixed(2)),
        y: Number(((Math.random() - 0.5) * 1.5).toFixed(2)),
        z: Number(((Math.random() - 0.5) * 2.0).toFixed(2)),
      },
      motorPWM: pwm,
      timestamp: now,
    },
    sensors: {
      hallSensor: 'CONNECTED',
      mpu6050: 'CONNECTED',
      currentSensor: 'CONNECTED',
      esp32: 'CONNECTED',
      wifi: 'CONNECTED',
      firebase: 'CONNECTED',
      lastUpdated: now,
    },
  };

  const dataString = JSON.stringify(payload);
  const url = new URL(`${DATABASE_URL}/devices/${DEVICE_ID}.json`);

  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString),
    },
  };

  const req = https.request(url, options, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      process.stdout.write(`\r[${new Date().toLocaleTimeString()}] Telemetry Sent -> RPM: ${rpm} | Current: ${current}A | Vib: ${vibration}g (HTTP ${res.statusCode})`);
    } else {
      console.log(`\n⚠ Response: HTTP ${res.statusCode} ${res.statusMessage}`);
    }
  });

  req.on('error', (err) => {
    console.error(`\n❌ Network Error:`, err.message);
  });

  req.write(dataString);
  req.end();
}

// Publish every 1 second (1 Hz)
console.log('Publishing telemetry stream every 1000ms. Press Ctrl+C to terminate.\n');
publishPacket();
setInterval(publishPacket, 1000);
