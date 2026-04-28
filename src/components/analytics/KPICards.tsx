import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { AnalyticsOverview } from '../../types';

interface KPICardsProps {
  data: AnalyticsOverview | null;
  compareEnabled: boolean;
}

interface KPIItem {
  label: string;
  key: keyof Omit<AnalyticsOverview, 'comparison'>;
  format: 'number' | 'currency' | 'percent';
}

const KPI_ITEMS: KPIItem[] = [
  { label: 'Total Orders', key: 'total_orders', format: 'number' },
  { label: 'Total Sales', key: 'total_sales', format: 'currency' },
  { label: 'Avg. Order Value', key: 'average_order_value', format: 'currency' },
  { label: 'Conversion Rate', key: 'conversion_rate', format: 'percent' },
  { label: 'Active Users', key: 'active_users', format: 'number' },
  { label: 'New App Users', key: 'new_app_users', format: 'number' },
];

function formatValue(value: number | null | undefined, format: KPIItem['format']): string {
  const v = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  switch (format) {
    case 'currency': return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'percent': return `${v.toFixed(1)}%`;
    default: return v.toLocaleString();
  }
}

function getChangePercent(current: number | null | undefined, previous: number | null | undefined): number {
  const c = typeof current === 'number' && Number.isFinite(current) ? current : 0;
  const p = typeof previous === 'number' && Number.isFinite(previous) ? previous : 0;
  if (p === 0) return c > 0 ? 100 : 0;
  return ((c - p) / p) * 100;
}

export function KPICards({ data, compareEnabled }: KPICardsProps) {
  if (!data) {
    return (
      <View style={styles.grid}>
        {KPI_ITEMS.map(item => (
          <View key={item.key} style={styles.card}>
            <View style={styles.skeletonLabel} />
            <View style={styles.skeletonValue} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {KPI_ITEMS.map(item => {
        const currentValue = data[item.key];
        const previousValue = data.comparison?.[item.key];
        const change = compareEnabled && previousValue !== undefined
          ? getChangePercent(currentValue, previousValue)
          : null;

        return (
          <View key={item.key} style={styles.card}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{formatValue(currentValue, item.format)}</Text>
            {change !== null && (
              <View style={styles.changeRow}>
                <Text
                  style={[
                    styles.changeText,
                    change > 0 ? styles.changePositive : change < 0 ? styles.changeNegative : styles.changeNeutral,
                  ]}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </Text>
                <Text style={styles.comparePeriod}>vs prev. period</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, ...shadows.sm,
  },
  label: {
    ...typography.caption, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: spacing.xs,
  },
  value: { ...typography.h2, color: colors.text },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  changeText: { ...typography.captionMedium },
  changePositive: { color: colors.success },
  changeNegative: { color: colors.error },
  changeNeutral: { color: colors.textTertiary },
  comparePeriod: { ...typography.small, color: colors.textTertiary },
  // Skeleton
  skeletonLabel: {
    width: 80, height: 10, backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm, marginBottom: spacing.sm,
  },
  skeletonValue: {
    width: 100, height: 24, backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm,
  },
});
