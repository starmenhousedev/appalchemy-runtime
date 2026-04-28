import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { ConversionFunnelStep } from '../../types';
import { safeNumber } from './utils';

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

const FUNNEL_COLORS = ['#6C5CE7', '#A29BFE', '#74B9FF', '#00CEC9', '#00B894'];

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const safeData = Array.isArray(data) ? data.filter(Boolean) : [];
  const counts = safeData.map(d => safeNumber(d?.count));
  const firstCount = counts[0] ?? 0;
  const maxCount = Math.max(...counts, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversion Funnel</Text>

      {safeData.length > 0 ? (
        <View style={styles.funnel}>
          {safeData.map((step, index) => {
            const stepCount = safeNumber(step?.count);
            const prevCount = index > 0 ? safeNumber(safeData[index - 1]?.count) : stepCount;

            // Prefer API-provided percentage; otherwise derive from first step.
            const apiPct = safeNumber(step?.percentage);
            const derivedPct = firstCount > 0 ? (stepCount / firstCount) * 100 : 0;
            const percentage = apiPct > 0 ? apiPct : derivedPct;

            const widthPct = Math.max((stepCount / maxCount) * 100, 15);
            const dropOff =
              index > 0 && prevCount > 0
                ? (((prevCount - stepCount) / prevCount) * 100).toFixed(1)
                : null;

            return (
              <View key={`${step?.step ?? 'step'}-${index}`} style={styles.stepRow}>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepLabel}>{STEP_LABELS[step?.step] || step?.step || 'Step'}</Text>
                  <Text style={styles.stepCount}>{stepCount.toLocaleString()}</Text>
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
                    <Text style={styles.barPct}>{percentage.toFixed(1)}%</Text>
                  </View>
                </View>
                {dropOff !== null && <Text style={styles.dropOff}>-{dropOff}%</Text>}
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  title: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.lg },
  funnel: { gap: spacing.md },
  stepRow: {},
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepLabel: { ...typography.captionMedium, color: colors.text },
  stepCount: { ...typography.captionMedium, color: colors.textSecondary },
  barContainer: {
    height: 32,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  funnelBar: {
    height: '100%',
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    minWidth: 45,
  },
  barPct: { ...typography.small, color: colors.textInverse, fontWeight: '600' },
  dropOff: {
    ...typography.small,
    color: colors.error,
    textAlign: 'right',
    marginTop: 2,
  },
  emptyState: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
