import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { HealthSeverity, ThresholdConfiguration } from '../types/telemetry';
import { formatRPM } from '../utils/formatting';

interface RPMGaugeProps {
  rpm: number;
  targetRpm?: number;
  thresholds: ThresholdConfiguration;
  status: HealthSeverity;
  motorRunning: boolean;
}

export const RPMGauge: React.FC<RPMGaugeProps> = ({
  rpm,
  targetRpm = 2500,
  thresholds,
  status,
  motorRunning,
}) => {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc angles from 140 degrees to 400 degrees (260 degree arc)
  const startAngle = 140;
  const endAngle = 400;
  const totalAngle = endAngle - startAngle;

  const maxDisplayRpm = Math.max(thresholds.maxRPM * 1.15, 4000);
  const ratio = Math.min(1, Math.max(0, rpm / maxDisplayRpm));
  const currentAngle = startAngle + ratio * totalAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(x, y, r, start);
    const endPoint = polarToCartesian(x, y, r, end);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return ['M', startPoint.x, startPoint.y, 'A', r, r, 0, largeArcFlag, 1, endPoint.x, endPoint.y].join(' ');
  };

  const getStatusColor = () => {
    if (status === 'CRITICAL') return Colors.critical;
    if (status === 'WARNING') return Colors.warning;
    return Colors.nominal;
  };

  const needleColor = getStatusColor();
  const needlePoint = polarToCartesian(cx, cy, radius - 10, currentAngle);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>PROPULSION TACHOMETER</Text>
        <View style={[styles.statusPill, { borderColor: needleColor }]}>
          <Text style={[styles.statusText, { color: needleColor }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.gaugeWrapper}>
        <Svg width={size} height={size}>
          {/* Background Track Arc */}
          <Path
            d={describeArc(cx, cy, radius, startAngle, endAngle)}
            stroke={Colors.border}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />

          {/* Active Value Progress Arc */}
          {ratio > 0.01 && (
            <Path
              d={describeArc(cx, cy, radius, startAngle, currentAngle)}
              stroke={needleColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Needle Center Pivot */}
          <Circle cx={cx} cy={cy} r={8} fill={Colors.surfaceElevated} stroke={needleColor} strokeWidth={2} />

          {/* Needle Line */}
          <Line
            x1={cx}
            y1={cy}
            x2={needlePoint.x}
            y2={needlePoint.y}
            stroke={needleColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </Svg>

        <View style={styles.centerOverlay}>
          <Text style={[styles.rpmValue, { color: needleColor }]}>{formatRPM(rpm)}</Text>
          <Text style={styles.rpmUnit}>RPM</Text>
          <Text style={[styles.motorStateText, { color: motorRunning ? Colors.nominal : Colors.textMuted }]}>
            {motorRunning ? 'RUNNING' : 'STOPPED'}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>TARGET</Text>
          <Text style={styles.metaVal}>{formatRPM(targetRpm)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>WARN LIMIT</Text>
          <Text style={styles.metaVal}>{formatRPM(thresholds.warnRPM)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>CUTOFF</Text>
          <Text style={[styles.metaVal, { color: Colors.critical }]}>{formatRPM(thresholds.maxRPM)}</Text>
        </View>
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
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusPill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  gaugeWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 55,
  },
  rpmValue: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  rpmUnit: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginTop: -2,
  },
  motorStateText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  metaVal: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginTop: 2,
  },
});
