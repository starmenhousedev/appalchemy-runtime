import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { AppInstallData } from '../../types';

interface AppInstallsChartProps {
  data: AppInstallData[];
}

const PLATFORM_COLORS: Record<string, string> = {
  android: '#3DDC84',
  ios: '#007AFF',
};

export function AppInstallsChart({ data }: AppInstallsChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Installs</Text>
      <Text style={styles.totalValue}>{total.toLocaleString()}</Text>

      {total > 0 ? (
        <>
          {/* Horizontal stacked bar */}
          <View style={styles.bar}>
            {data.map(item => {
              const pct = (item.count / total) * 100;
              return (
                <View
                  key={item.platform}
                  style={[
                    styles.barSegment,
                    {
                      width: `${pct}%`,
                      backgroundColor: PLATFORM_COLORS[item.platform] || colors.textTertiary,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {data.map(item => {
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
              return (
                <View key={item.platform} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: PLATFORM_COLORS[item.platform] || colors.textTertiary },
                    ]}
                  />
                  <Text style={styles.legendLabel}>
                    {item.platform === 'android' ? 'Android' : 'iOS'}
                  </Text>
                  <Text style={styles.legendValue}>
                    {item.count.toLocaleString()} ({pct}%)
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
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, ...shadows.sm,
  },
  title: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.xs },
  totalValue: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  bar: {
    flexDirection: 'row', height: 24, borderRadius: borderRadius.md,
    overflow: 'hidden', backgroundColor: colors.surfaceSecondary,
  },
  barSegment: { height: '100%' },
  legend: { marginTop: spacing.md, gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { ...typography.captionMedium, color: colors.text, flex: 1 },
  legendValue: { ...typography.caption, color: colors.textSecondary },
  emptyState: {
    height: 60, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
