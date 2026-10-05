import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { HealthSeverity, ThresholdConfiguration } from '../types/telemetry';
import { formatCurrent } from '../utils/formatting';

interface CurrentGaugeProps {
  current: number;
  thresholds: ThresholdConfiguration;
  status: HealthSeverity;
}

export const CurrentGauge: React.FC<CurrentGaugeProps> = ({
  current,
  thresholds,
  status,
}) => {
  const maxScale = Math.max(thresholds.maxCurrent * 1.3, 2.5);
  const ratio = Math.min(1, Math.max(0, current / maxScale));

  const isCritical = status === 'CRITICAL';
  const isWarning = status === 'WARNING';

  const barColor = isCritical ? Colors.critical : isWarning ? Colors.warning : Colors.nominal;

  return (
    <View style={[styles.card, isCritical && { borderColor: Colors.critical }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>PROPULSION CURRENT</Text>
          <Text style={styles.subTitle}>ACS712 SENSOR FEED</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: barColor, backgroundColor: isCritical ? 'rgba(255, 42, 85, 0.15)' : 'transparent' }]}>
          <Text style={[styles.statusText, { color: barColor }]}>
            {isCritical ? 'OVER CURRENT' : status}
          </Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.mainValue, { color: barColor }]}>{formatCurrent(current)}</Text>
        <Text style={styles.unit}>AMPERES (A)</Text>
      </View>

      {/* High-tech Multi-segment Bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${ratio * 100}%`, backgroundColor: barColor }]} />
        {/* Threshold Markers */}
        <View
          style={[
            styles.thresholdLine,
            { left: `${(thresholds.warnCurrent / maxScale) * 100}%`, backgroundColor: Colors.warning },
          ]}
        />
        <View
          style={[
            styles.thresholdLine,
            { left: `${(thresholds.maxCurrent / maxScale) * 100}%`, backgroundColor: Colors.critical },
          ]}
        />
      </View>

      <View style={styles.scaleLabels}>
        <Text style={styles.scaleText}>0.0A</Text>
        <Text style={[styles.scaleText, { color: Colors.warning }]}>WARN: {thresholds.warnCurrent}A</Text>
        <Text style={[styles.scaleText, { color: Colors.critical }]}>CUTOFF: {thresholds.maxCurrent}A</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  subTitle: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 4,
  },
  mainValue: {
    fontSize: 30,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  unit: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  barTrack: {
    height: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  thresholdLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 2,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  scaleText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
});
