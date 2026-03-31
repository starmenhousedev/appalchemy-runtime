import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { ConversionFunnelStep } from '../../types';

interface ConversionFunnelChartProps {
  data: ConversionFunnelStep[];
}

const STEP_LABELS: Record<string, string> = {
  session_start: 'Session Start',
  view_item: 'View Item',
  add_to_cart: 'Add to Cart',
  begin_checkout: 'Begin Checkout',
  purchase: 'Purchase',
};

const FUNNEL_COLORS = [
  '#6C5CE7',
  '#A29BFE',
  '#74B9FF',
  '#00CEC9',
  '#00B894',
];

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversion Funnel</Text>

      {data.length > 0 ? (
        <View style={styles.funnel}>
          {data.map((step, index) => {
            const widthPct = Math.max((step.count / maxCount) * 100, 15);
            const dropOff = index > 0
              ? ((data[index - 1].count - step.count) / data[index - 1].count * 100).toFixed(1)
              : null;

            return (
              <View key={step.step} style={styles.stepRow}>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepLabel}>
                    {STEP_LABELS[step.step] || step.step}
                  </Text>
                  <Text style={styles.stepCount}>{step.count.toLocaleString()}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.funnelBar,
                      {
                        width: `${widthPct}%`,
                        backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length],
                      },
                    ]}>
                    <Text style={styles.barPct}>{step.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
                {dropOff !== null && (
                  <Text style={styles.dropOff}>-{dropOff}%</Text>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No funnel data</Text>
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
  title: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.lg },
  funnel: { gap: spacing.md },
  stepRow: {},
  stepInfo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepLabel: { ...typography.captionMedium, color: colors.text },
  stepCount: { ...typography.captionMedium, color: colors.textSecondary },
  barContainer: {
    height: 32, backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm, overflow: 'hidden',
  },
  funnelBar: {
    height: '100%', borderRadius: borderRadius.sm,
    justifyContent: 'center', paddingHorizontal: spacing.sm,
    minWidth: 45,
  },
  barPct: { ...typography.small, color: colors.textInverse, fontWeight: '600' },
  dropOff: {
    ...typography.small, color: colors.error,
    textAlign: 'right', marginTop: 2,
  },
  emptyState: {
    height: 80, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
