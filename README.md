# 🚀 Launch Vehicle Health Monitoring & Emergency Thrust Control System

> **Educational prototype inspired by launch-vehicle propulsion health monitoring.**  
> *Notice: This is an educational and exhibition engineering project. It does not replicate the classified control architecture of ISRO LVM3, PSLV, or any operational flight vehicle.*

---

## 📌 1. Project Overview

The **Launch Vehicle Health Monitoring & Emergency Control System** is a mission-critical IoT and telemetry dashboard built for real-time propulsion health grading, 6-DOF dynamic monitoring, and automated safety interlocks.

The physical prototype monitors a high-speed DC motor (simulating a liquid rocket engine/turbopump) using:
- **Hall Effect Sensor** for rotational velocity (RPM)
- **ACS712 Hall-Current Sensor** for motor electrical draw (Amperes)
- **MPU6050 6-DOF IMU** for structural vibration and 3-axis acceleration/gyroscope dynamics
- **ESP32 Edge Microcontroller** executing primary autonomous safety cutoff loops
- **Firebase Realtime Database** for low-latency cloud pub/sub
- **React Native Expo Application** functioning as the Aerospace Mission Control terminal

---

## 🛡 2. Core Safety Principle: Hardware-First Cutoff

```
┌─────────────────────────────────────────────────────────────┐
│               ESP32 AUTONOMOUS SAFETY LAYER                 │
│  [Hall Effect]   [ACS712 Current]   [MPU6050 Vibration]     │
│         │                │                   │              │
│         ▼                ▼                   ▼              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Autonomous Edge Loop (200 Hz / 5ms cycle)          │  │
│  │   • Overcurrent  (> 1.80 A)  ==> CUTOFF MOTOR         │  │
│  │   • Overspeed    (> 3500 RPM)==> CUTOFF MOTOR         │  │
│  │   • Vibration    (> 0.35 g)  ==> CUTOFF MOTOR         │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │ (Physical Relay / Motor Driver) │
│                           ▼                                 │
│                  [MOTOR SEVER / STOP]                       │
└───────────────────────────┬─────────────────────────────────┘
                            │ Wi-Fi Telemetry Stream
                            ▼
              ┌───────────────────────────┐
              │    Firebase Realtime DB   │
              └─────────────┬─────────────┘
                            │ Real-time Subscription
                            ▼
              ┌───────────────────────────┐
              │ React Native Mission App  │
              │  (Monitoring & Interlock) │
              └───────────────────────────┘
```

> [!IMPORTANT]
> **The ESP32 is the Primary Real-Time Safety Controller.**  
> The mobile application is primarily a monitoring, telemetry visualization, and telemetry analysis interface.  
> Under no circumstances does physical motor emergency cutoff depend on Wi-Fi, internet connection, Firebase, or a smartphone. If connectivity is lost, the ESP32 independently severs motor drive within milliseconds if an anomaly threshold is breached.

---

## 🏗 3. Software Architecture

```
src/
├── app/
│   ├── _layout.tsx           # Master Stack, Providers, Dark aerospace theme
│   ├── index.tsx             # Route guard & initialization
│   ├── login.tsx             # Aerospace operator login & Exhibition Guest bypass
│   ├── register.tsx          # Operator enrollment terminal
│   └── (tabs)/
│       ├── _layout.tsx       # Bottom tabs navigation with live fault badges
│       ├── dashboard.tsx     # Mission Control Dashboard (Gauges, Health Ring, Status)
│       ├── telemetry.tsx     # High-frequency waveforms & 6-DOF IMU dynamics
│       ├── faults.tsx        # Real-time anomaly feed, severity filters, cutoff snapshots
│       ├── device.tsx        # Hardware controller specs & bidirectional test signals
│       └── settings.tsx      # Central threshold calibration & Live/Demo toggle
├── components/
│   ├── ConnectionStatus.tsx  # Online, Offline, Stale, & Simulated Demo indicators
│   ├── CurrentGauge.tsx      # Linear/radial ACS712 current shunt gauge
│   ├── EmergencyStatus.tsx   # Critical cutoff alert banner with telemetry snapshot
│   ├── FaultBanner.tsx       # Active anomaly alerts
│   ├── HealthScore.tsx       # 0–100 radial health ring with diagnostic deductions
│   ├── MissionStatus.tsx     # Mission state banner with UTC/local time
│   ├── RPMGauge.tsx          # SVG tachometer arc with target & warning markers
│   ├── SensorCard.tsx        # 6-point hardware bus health matrix
│   ├── SimulationControlModal.tsx # Multi-phase flight sequence simulator
│   ├── StatusIndicator.tsx   # Glowing aerospace status beacons
│   ├── TelemetryCard.tsx     # Modular telemetry data tiles
│   └── TelemetryChart.tsx    # Live SVG waveform chart with selectable time windows
├── constants/
│   ├── colors.ts             # Deep space palette (#040814, cyan, emerald, amber, crimson)
│   └── config.ts             # Central thresholds, devices, and app metadata
├── context/
│   ├── AuthContext.tsx       # Operator session with AsyncStorage persistence
│   └── MissionContext.tsx    # Centralized RTDB subscriptions & simulation engine
├── hooks/
│   ├── useAuth.ts
│   ├── useDeviceStatus.ts
│   ├── useFaults.ts
│   └── useTelemetry.ts
├── services/
│   ├── authService.ts        # Firebase Auth + demo bypass
│   ├── deviceService.ts      # Device status, sensors, and threshold sync
│   ├── faultService.ts       # Active faults & historical audit logging
│   ├── firebase.ts           # Modular Firebase v12 initialization
│   ├── simulationEngine.ts   # Multi-phase rocket telemetry simulation engine
│   └── telemetryService.ts   # Real-time RTDB stream listener with safe cleanup
├── types/
│   ├── device.ts             # Device, sensors, and control interfaces
│   ├── faults.ts             # Fault events, severity, and snapshots
│   └── telemetry.ts          # Telemetry packet, health, and thresholds
└── utils/
    ├── formatting.ts         # Engineering units formatting (RPM, A, g, uptime)
    ├── healthCalculation.ts  # Modular propulsion health scoring algorithm
    ├── thresholds.ts         # Threshold evaluation and stale stream detection
    └── validation.ts         # Defensive sanitization of cloud telemetry packets
```

---

## 📊 4. Firebase Realtime Database Schema

Path: `/devices/{deviceId}/`

```json
{
  "devices": {
    "DEVICE-001": {
      "status": {
        "online": true,
        "lastSeen": 1718012400000,
        "motorRunning": true,
        "motorState": "RUNNING",
        "emergencyStop": false,
        "emergencyReason": "",
        "firmwareVersion": "v1.0.4-ESP32-CORE",
        "uptimeSeconds": 1420,
        "wifiSSID": "MISSION_CONTROL_5G",
        "wifiRSSI": -52,
        "ipAddress": "192.168.1.144"
      },
      "telemetry": {
        "rpm": 2487,
        "current": 0.82,
        "vibration": 0.072,
        "acceleration": {
          "x": 0.01,
          "y": 0.03,
          "z": 1.05
        },
        "gyroscope": {
          "x": 0.02,
          "y": 0.01,
          "z": 0.04
        },
        "motorPWM": 180,
        "timestamp": 1718012400000
      },
      "sensors": {
        "hallSensor": "CONNECTED",
        "mpu6050": "CONNECTED",
        "currentSensor": "CONNECTED",
        "esp32": "CONNECTED",
        "wifi": "CONNECTED",
        "firebase": "CONNECTED",
        "lastUpdated": 1718012400000
      },
      "thresholds": {
        "minRPM": 600,
        "maxRPM": 3500,
        "warnRPM": 3100,
        "maxCurrent": 1.80,
        "warnCurrent": 1.35,
        "maxVibration": 0.35,
        "warnVibration": 0.18,
        "staleTimeoutMs": 4000
      },
      "control": {
        "armed": false,
        "motorEnabled": false,
        "emergencyStop": false,
        "resetFaults": false,
        "updatedAt": 1718012400000
      },
      "faults": {
        "active_fault_id": {
          "id": "FAULT-001",
          "type": "OVER_CURRENT",
          "severity": "CRITICAL",
          "message": "Motor overload: Current 2.15 A exceeded 1.80 A cutoff limit.",
          "timestamp": 1718012395000,
          "snapshot": {
            "rpm": 2100,
            "current": 2.15,
            "vibration": 0.08,
            "pwm": 180,
            "timestamp": 1718012395000
          }
        }
      },
      "events": {
        "-Nx123abc": {
          "type": "EMERGENCY_SHUTDOWN",
          "severity": "CRITICAL",
          "message": "Automatic emergency cutoff active: motor power severed.",
          "timestamp": 1718012395000
        }
      }
    }
  }
}
```

---

## 🧮 5. Propulsion Health Scoring Algorithm (`healthCalculation.ts`)

The overall health of the propulsion system is graded on a **0 to 100** scale:
- **100 points:** Base nominal score.
- **-60 points:** Emergency shutdown active.
- **-50 points:** Controller offline or telemetry stream stale (> 4 sec without packet).
- **-35 points:** Critical overcurrent (`current >= maxCurrent`).
- **-15 points:** Warning current level (`current >= warnCurrent`).
- **-30 points:** Critical structural vibration (`vibration >= maxVibration`).
- **-12 points:** Warning vibration level (`vibration >= warnVibration`).
- **-30 points:** Critical overspeed (`rpm > maxRPM`).
- **-15 points:** Motor stall / underspeed during burn (`rpm < minRPM`).
- **-12 points:** For each disconnected sensor bus (Hall, MPU6050, ACS712).
- **-20 points:** Presence of active critical fault log.

**Health Status Levels:**
- **85 – 100:** `SYSTEM NOMINAL` (Emerald Glow)
- **50 – 84:** `SYSTEM WARNING` (Amber Glow)
- **0 – 49:** `CRITICAL ALERT` (Crimson Glow)

---

## 🔌 6. ESP32 Hardware Integration Contract

### Pinout Reference
| Sensor / Peripheral | ESP32 Pin | Interface | Function |
|---|---|---|---|
| **Hall Effect Sensor** | GPIO 18 | Digital (Interrupt) | Tachometer pulse counter |
| **MPU-6050 IMU** | GPIO 21 (SDA), 22 (SCL) | I2C | Vibration & 6-DOF dynamics |
| **ACS712 Current Sensor** | GPIO 34 | Analog (ADC1) | Motor current shunt |
| **Motor Driver PWM** | GPIO 25 | LEDC / PWM | Speed control |
| **Emergency Cutoff Relay** | GPIO 26 | Digital Output | Hardware power cutoff |
| **Status LED & Buzzer** | GPIO 27, GPIO 14 | Digital Output | Audio/Visual alarm |

### Sample ESP32 Arduino Firmware Loop

```cpp
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <MPU6050.h>

#define CURRENT_PIN        34
#define HALL_PIN           18
#define RELAY_PIN          26
#define PWM_PIN            25

const float MAX_CURRENT_AMPS  = 1.80;
const float MAX_VIBRATION_G   = 0.35;
const int   MAX_RPM           = 3500;

volatile unsigned long pulseCount = 0;
void IRAM_ATTR onHallPulse() { pulseCount++; }

void checkAutonomousSafety(float current, float vibration, int rpm) {
  // CRITICAL: Autonomous Edge Safety Controller Cutoff
  if (current >= MAX_CURRENT_AMPS || vibration >= MAX_VIBRATION_G || rpm >= MAX_RPM) {
    digitalWrite(RELAY_PIN, LOW); // Immediate hardware power cutoff
    ledcWrite(0, 0);              // Zero PWM
    publishCriticalFault(current, vibration, rpm);
  }
}
```

---

## 🚀 7. Exhibition Demo Mode & Launch Simulation

To demonstrate the full capability of the system during an exhibition or project evaluation **even when physical hardware is disconnected**, the application includes a multi-phase Launch Simulator:

1. Open **CONFIG** (Settings tab) or tap **LAUNCH SIMULATOR** on the Dashboard.
2. Toggle **EXHIBITION DEMO MODE** to `ON`.
3. Tap **LAUNCH SIMULATION CONTROLLER** to open the flight profile sequence:
   - `PRE-LAUNCH` — Ground telemetry test, idle motor, sensors calibrated.
   - `IGNITION` — Thrust initiation, initial motor PWM.
   - `RPM RISING` — Velocity ramping smoothly to rated speed.
   - `NOMINAL FLIGHT` — Rated 2500 RPM, stable current (0.82 A) and low vibration (0.07 g).
   - `ANOMALY INDUCED` — Dynamic anomaly injection (Overcurrent / High Vibration / Overspeed).
   - `FAULT DETECTED` — Safety limit breached; dashboard activates emergency warning.
   - `AUTOMATIC ABORT` — ESP32 edge logic engages cutoff; motor power severed.
   - `MOTOR STOPPED` — Propulsion at zero RPM with safety interlock active.

Judges can clearly verify the **SIMULATED DEMO MODE** badge on the dashboard.

---

## 🛠 8. Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or bun

### 1. Clone & Install Dependencies
```bash
git clone <repository_url>
cd "ISRO Project"
npm install
```

### 2. Configure Firebase (Optional for Demo Mode)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-app-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### 3. Deploy Firebase Security Rules
In Firebase Console, navigate to **Realtime Database > Rules**, and paste the contents of `database.rules.json`.

### 4. Start the Application
```bash
npx expo start
```
- Press `w` to open in a web browser.
- Scan the QR code using **Expo Go** on Android or iOS.

---

## 🧪 9. Verification & Code Quality

The codebase enforces strict TypeScript typing and Expo linting:

```bash
# Type check without emitting files
npx tsc --noEmit

# Lint check
npx expo lint

# Diagnose dependencies and configuration
npx expo-doctor
```

---

## 👥 10. Team Responsibilities
- **Embedded & Hardware Engineer:** Physical DC motor stand, MPU6050 wiring, Hall effect sensor, ACS712 current shunt, relay cutoff circuitry, ESP32 firmware.
- **Software & Systems Architect:** Mobile Mission Control application, Firebase Realtime Database integration, health scoring algorithms, telemetry visualization, and safety interlocks.
