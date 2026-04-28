import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { AppInstallData } from '../../types';
import { safeNumber } from './utils';

interface AppInstallsChartProps {
  data: AppInstallData[];
}

const PLATFORM_COLORS: Record<string, string> = {
  android: '#3DDC84',
  ios: '#007AFF',
};

export function AppInstallsChart({ data }: AppInstallsChartProps) {
  const safeData = Array.isArray(data) ? data.filter(Boolean) : [];
  const total = safeData.reduce((sum, d) => sum + safeNumber(d?.count), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Installs</Text>
      <Text style={styles.totalValue}>{total.toLocaleString()}</Text>

      {total > 0 ? (
        <>
          {/* Horizontal stacked bar */}
          <View style={styles.bar}>
            {safeData.map((item, idx) => {
              const count = safeNumber(item?.count);
              const pct = (count / total) * 100;
              return (
                <View
                  key={`${item?.platform ?? 'p'}-${idx}`}
                  style={[
                    styles.barSegment,
                    {
                      width: `${pct}%`,
                      backgroundColor: PLATFORM_COLORS[item?.platform ?? ''] || colors.textTertiary,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {safeData.map((item, idx) => {
              const count = safeNumber(item?.count);
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
              return (
                <View key={`${item?.platform ?? 'p'}-${idx}`} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: PLATFORM_COLORS[item?.platform ?? ''] || colors.textTertiary },
                    ]}
                  />
                  <Text style={styles.legendLabel}>
                    {item?.platform === 'android' ? 'Android' : item?.platform === 'ios' ? 'iOS' : item?.platform || '—'}
                  </Text>
                  <Text style={styles.legendValue}>
                    {count.toLocaleString()} ({pct}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No install data</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  title: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.xs },
  totalValue: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  bar: {
    flexDirection: 'row',
    height: 24,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
  },
  barSegment: { height: '100%' },
  legend: { marginTop: spacing.md, gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { ...typography.captionMedium, color: colors.text, flex: 1 },
  legendValue: { ...typography.caption, color: colors.textSecondary },
  emptyState: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
