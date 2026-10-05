import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useFaults } from '../../hooks/useFaults';

export default function TabLayout() {
  const { hasCriticalFault, activeFaults } = useFaults();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSecondary,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.cyan,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'DASHBOARD',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="telemetry"
        options={{
          title: 'TELEMETRY',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="faults"
        options={{
          title: 'FAULTS',
          tabBarBadge: activeFaults.length > 0 ? activeFaults.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: hasCriticalFault ? Colors.critical : Colors.warning,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 'bold',
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={hasCriticalFault ? 'warning' : 'warning-outline'}
              size={size - 2}
              color={hasCriticalFault ? Colors.critical : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="device"
        options={{
          title: 'HARDWARE',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hardware-chip-outline" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'CONFIG',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options-outline" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
