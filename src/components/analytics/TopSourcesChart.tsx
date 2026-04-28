import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { TopSource } from '../../types';
import { safeNumber } from './utils';

interface TopSourcesChartProps {
  data: TopSource[];
}

const SOURCE_COLORS = [
  colors.primary,
  colors.secondary,
  '#FDCB6E',
  colors.error,
  '#A29BFE',
  '#74B9FF',
];

export function TopSourcesChart({ data }: TopSourcesChartProps) {
  const safeData = Array.isArray(data) ? data.filter(Boolean) : [];
  const totalCount = safeData.reduce((s, d) => s + safeNumber(d?.count), 0);
  const maxCount = Math.max(...safeData.map(d => safeNumber(d?.count)), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Sources</Text>

      {safeData.length > 0 ? (
        <View style={styles.list}>
          {safeData.map((source, index) => {
            const count = safeNumber(source?.count);
            const apiPct = safeNumber(source?.percentage);
            const pct = apiPct > 0 ? apiPct : totalCount > 0 ? (count / totalCount) * 100 : 0;
            return (
              <View key={`${source?.source ?? 'src'}-${index}`} style={styles.row}>
                <View style={styles.labelRow}>
                  <View style={[styles.dot, { backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }]} />
                  <Text style={styles.sourceName}>{source?.source ?? 'Unknown'}</Text>
                  <Text style={styles.sourceCount}>{count.toLocaleString()}</Text>
                  <Text style={styles.sourcePct}>{pct.toFixed(1)}%</Text>
                </View>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length],
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No source data</Text>
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
  list: { gap: spacing.md },
  row: {},
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sourceName: { ...typography.captionMedium, color: colors.text, flex: 1, textTransform: 'capitalize' },
  sourceCount: { ...typography.captionMedium, color: colors.text },
  sourcePct: { ...typography.caption, color: colors.textTertiary, width: 40, textAlign: 'right' },
  barBg: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: borderRadius.sm },
  emptyState: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
