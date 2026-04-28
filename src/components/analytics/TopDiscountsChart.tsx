import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { TopDiscount } from '../../types';
import { safeNumber } from './utils';

interface TopDiscountsChartProps {
  data: TopDiscount[];
}

export function TopDiscountsChart({ data }: TopDiscountsChartProps) {
  const safeData = Array.isArray(data) ? data.filter(Boolean) : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Discounts</Text>

      {safeData.length > 0 ? (
        <View style={styles.list}>
          {safeData.map((discount, index) => (
            <View key={discount?.discount_id ?? index} style={styles.row}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={styles.info}>
                <Text style={styles.discountTitle} numberOfLines={1}>
                  {discount?.title ?? 'Untitled'}
                </Text>
                <Text style={styles.discountMeta}>
                  {safeNumber(discount?.usage_count).toLocaleString()} uses
                </Text>
              </View>
              <Text style={styles.revenue}>
                ${safeNumber(discount?.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No discount data</Text>
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
  title: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  rank: { ...typography.captionMedium, color: colors.textTertiary, width: 28 },
  info: { flex: 1 },
  discountTitle: { ...typography.captionMedium, color: colors.text },
  discountMeta: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  revenue: { ...typography.bodyMedium, color: colors.success },
  emptyState: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
