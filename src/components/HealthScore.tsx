import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { HealthStatus } from '../types/telemetry';

interface HealthScoreProps {
  health: HealthStatus;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ health }) => {
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  const getColor = () => {
    if (health.score >= 85) return Colors.nominal;
    if (health.score >= 50) return Colors.warning;
    return Colors.critical;
  };

  const ringColor = getColor();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>PROPULSION SYSTEM INTEGRITY</Text>
        <Text style={[styles.statusText, { color: ringColor }]}>{health.overallStatus}</Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.gaugeContainer}>
          <Svg width={size} height={size}>
            {/* Background Ring */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.surfaceElevated}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Ring */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>

          <View style={styles.scoreOverlay}>
            <Text style={[styles.scoreValue, { color: ringColor }]}>{health.score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsHeader}>DIAGNOSTIC FACTORS</Text>
          {health.reasons.length === 0 ? (
            <View style={styles.nominalFactor}>
              <Text style={styles.nominalCheck}>✓</Text>
              <Text style={styles.nominalText}>All propulsion subsystems nominal</Text>
            </View>
          ) : (
            health.reasons.slice(0, 3).map((reason, idx) => (
              <View key={idx} style={styles.reasonRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.reasonText} numberOfLines={2}>{reason}</Text>
              </View>
            ))
          )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 11,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  gaugeContainer: {
    position: 'relative',
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  scoreMax: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: -4,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsHeader: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  nominalFactor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nominalCheck: {
    color: Colors.nominal,
    fontSize: 14,
    fontWeight: 'bold',
  },
  nominalText: {
    color: Colors.nominal,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  bullet: {
    color: Colors.warning,
    fontSize: 12,
  },
  reasonText: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'monospace',
    flex: 1,
  },
});
