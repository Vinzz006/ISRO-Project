import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { TelemetryHistoryPoint, TimeWindow } from '../types/telemetry';

export type ChartMetric = 'rpm' | 'current' | 'vibration' | 'motorPWM';

interface TelemetryChartProps {
  data: TelemetryHistoryPoint[];
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('rpm');
  const [selectedWindow, setSelectedWindow] = useState<TimeWindow>('1m');

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 48, 280);
  const chartHeight = 180;
  const paddingLeft = 36;
  const paddingRight = 14;
  const paddingTop = 14;
  const paddingBottom = 24;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  // Filter data according to selected time window using the latest recorded telemetry timestamp
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const latestTimestamp = data[data.length - 1]?.timestamp || 0;
    let windowMs = 60 * 1000;
    if (selectedWindow === '30s') windowMs = 30 * 1000;
    if (selectedWindow === '5m') windowMs = 5 * 60 * 1000;
    if (selectedWindow === '15m') windowMs = 15 * 60 * 1000;

    const cutoff = latestTimestamp - windowMs;
    const subset = data.filter((d) => d.timestamp >= cutoff);
    return subset.length >= 2 ? subset : data.slice(-20);
  }, [data, selectedWindow]);

  // Metric metadata
  const metricConfig = useMemo(() => {
    switch (selectedMetric) {
      case 'rpm':
        return {
          title: 'RPM STREAM',
          unit: 'RPM',
          color: Colors.cyan,
          formatter: (v: number) => Math.round(v).toString(),
          minScale: 3000,
        };
      case 'current':
        return {
          title: 'CURRENT STREAM',
          unit: 'A',
          color: Colors.warning,
          formatter: (v: number) => v.toFixed(2),
          minScale: 2.0,
        };
      case 'vibration':
        return {
          title: 'VIBRATION STREAM',
          unit: 'g',
          color: Colors.critical,
          formatter: (v: number) => v.toFixed(3),
          minScale: 0.4,
        };
      case 'motorPWM':
        return {
          title: 'PWM DRIVE',
          unit: '0-255',
          color: Colors.purple,
          formatter: (v: number) => Math.round(v).toString(),
          minScale: 255,
        };
    }
  }, [selectedMetric]);

  // Compute SVG line path
  const { pathD, minVal, maxVal, lastVal } = useMemo(() => {
    if (filteredData.length < 2) {
      return { pathD: '', minVal: 0, maxVal: metricConfig.minScale, lastVal: 0 };
    }

    const values = filteredData.map((d) => d[selectedMetric]);
    let max = Math.max(...values, metricConfig.minScale * 0.2);
    let min = Math.min(...values, 0);

    // Add 10% breathing room
    max = Math.max(max, metricConfig.minScale * 0.5);
    const range = max - min || 1;

    const points = filteredData.map((d, index) => {
      const x = paddingLeft + (index / (filteredData.length - 1)) * innerWidth;
      const y = paddingTop + innerHeight - ((d[selectedMetric] - min) / range) * innerHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const d = `M ${points.join(' L ')}`;
    return {
      pathD: d,
      minVal: min,
      maxVal: max,
      lastVal: values[values.length - 1] ?? 0,
    };
  }, [filteredData, selectedMetric, metricConfig, innerWidth, innerHeight, paddingLeft, paddingTop]);

  return (
    <View style={styles.card}>
      {/* Metric Selector Tabs */}
      <View style={styles.metricTabs}>
        {(['rpm', 'current', 'vibration', 'motorPWM'] as ChartMetric[]).map((m) => {
          const active = m === selectedMetric;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.metricTab, active && styles.metricTabActive]}
              onPress={() => setSelectedMetric(m)}
            >
              <Text style={[styles.metricTabText, active && styles.metricTabTextActive]}>
                {m.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chart Header */}
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartTitle}>{metricConfig.title}</Text>
          <Text style={styles.subtext}>LIVE TELEMETRY WAVEFORM</Text>
        </View>
        <View style={styles.valueBox}>
          <Text style={[styles.lastVal, { color: metricConfig.color }]}>
            {metricConfig.formatter(lastVal)}
          </Text>
          <Text style={styles.valUnit}>{metricConfig.unit}</Text>
        </View>
      </View>

      {/* SVG Canvas */}
      <View style={styles.svgWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Background grid box */}
          <Rect
            x={paddingLeft}
            y={paddingTop}
            width={innerWidth}
            height={innerHeight}
            fill={Colors.backgroundSecondary}
            stroke={Colors.border}
            strokeWidth={1}
          />

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = paddingTop + innerHeight * (1 - pct);
            const val = minVal + (maxVal - minVal) * pct;
            return (
              <React.Fragment key={pct}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + innerWidth}
                  y2={y}
                  stroke={Colors.border}
                  strokeWidth={1}
                  strokeDasharray="4, 4"
                />
                <SvgText
                  x={paddingLeft - 6}
                  y={y + 3}
                  fontSize={8}
                  fill={Colors.textMuted}
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {metricConfig.formatter(val)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Telemetry Waveform Path */}
          {pathD ? (
            <Path
              d={pathD}
              stroke={metricConfig.color}
              strokeWidth={2.5}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
        </Svg>
      </View>

      {/* Time Window Selectors */}
      <View style={styles.windowRow}>
        <Text style={styles.windowLabel}>WINDOW: </Text>
        {(['30s', '1m', '5m', '15m'] as TimeWindow[]).map((w) => {
          const active = w === selectedWindow;
          return (
            <TouchableOpacity
              key={w}
              style={[styles.windowBtn, active && styles.windowBtnActive]}
              onPress={() => setSelectedWindow(w)}
            >
              <Text style={[styles.windowBtnText, active && styles.windowBtnTextActive]}>
                {w}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  metricTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  metricTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  metricTabActive: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metricTabText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  metricTabTextActive: {
    color: Colors.cyan,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtext: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
  },
  valueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  lastVal: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  valUnit: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  svgWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  windowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  windowLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  windowBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  windowBtnActive: {
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
  },
  windowBtnText: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  windowBtnTextActive: {
    color: Colors.cyan,
  },
});
