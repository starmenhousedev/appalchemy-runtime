import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { TopSource } from '../../types';

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
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Sources</Text>

      {data.length > 0 ? (
        <View style={styles.list}>
          {data.map((source, index) => (
            <View key={source.source} style={styles.row}>
              <View style={styles.labelRow}>
                <View style={[styles.dot, { backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length] }]} />
                <Text style={styles.sourceName}>{source.source}</Text>
                <Text style={styles.sourceCount}>{source.count.toLocaleString()}</Text>
                <Text style={styles.sourcePct}>{source.percentage.toFixed(1)}%</Text>
              </View>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(source.count / maxCount) * 100}%`,
                      backgroundColor: SOURCE_COLORS[index % SOURCE_COLORS.length],
                    },
                  ]}
                />
              </View>
            </View>
          ))}
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
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, ...shadows.sm,
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
    height: 6, backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm, overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: borderRadius.sm },
  emptyState: {
    height: 60, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
