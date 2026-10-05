import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { HealthSeverity } from '../types/telemetry';

interface TelemetryCardProps {
  title: string;
  source?: string;
  value: string | number;
  unit?: string;
  status?: HealthSeverity;
  subValue?: string;
  subLabel?: string;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  title,
  source,
  value,
  unit,
  status = 'NOMINAL',
  subValue,
  subLabel,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'CRITICAL':
        return Colors.critical;
      case 'WARNING':
        return Colors.warning;
      case 'NOMINAL':
      default:
        return Colors.nominal;
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={[styles.card, status === 'CRITICAL' && { borderColor: Colors.critical }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {source ? <Text style={styles.source}>{source}</Text> : null}
        </View>
        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: statusColor }]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>

      {subValue ? (
        <View style={styles.footer}>
          {subLabel ? <Text style={styles.subLabel}>{subLabel}: </Text> : null}
          <Text style={styles.subValue}>{subValue}</Text>
        </View>
      ) : null}
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
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  source: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  unit: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 4,
  },
  subLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
  subValue: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
