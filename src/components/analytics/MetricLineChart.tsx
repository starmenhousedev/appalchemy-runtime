import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { DailyMetric } from '../../types';
import { safeNumber } from './utils';

interface MetricLineChartProps {
  title: string;
  data: DailyMetric[];
  compareEnabled: boolean;
  formatValue?: (v: number) => string;
  color?: string;
  suffix?: string;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '108, 92, 231';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export function MetricLineChart({
  title,
  data,
  compareEnabled,
  formatValue,
  color = colors.primary,
  suffix = '',
}: MetricLineChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.lg * 4;

  const chartData = useMemo(() => {
    const safeData = Array.isArray(data) ? data.filter(Boolean) : [];
    if (safeData.length === 0) return null;

    const labels = safeData.map(d => {
      const parts = (d?.date ?? '').split('-');
      return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : '';
    });

    // Show max 7 labels to avoid crowding
    const step = Math.max(1, Math.floor(labels.length / 6));
    const displayLabels = labels.map((l, i) => (i % step === 0 ? l : ''));

    const currentValues = safeData.map(d => safeNumber(d?.value));
    const datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }> = [
      {
        data: currentValues.length > 0 ? currentValues : [0],
        color: (opacity: number) => `rgba(${hexToRgb(color)}, ${opacity})`,
        strokeWidth: 2,
      },
    ];

    const hasCompare = compareEnabled && safeData.some(d => d?.compare_value != null);
    if (hasCompare) {
      datasets.push({
        data: safeData.map(d => safeNumber(d?.compare_value)),
        color: (opacity: number) => `rgba(173, 181, 189, ${opacity})`,
        strokeWidth: 1.5,
      });
    }

    return { labels: displayLabels, datasets, currentValues, hasCompare };
  }, [data, compareEnabled, color]);

  if (!chartData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyChart}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  const latestValue = safeNumber(chartData.currentValues[chartData.currentValues.length - 1]);
  const displayValue = formatValue
    ? formatValue(latestValue)
    : `${latestValue.toLocaleString()}${suffix}`;

  const rgbColor = hexToRgb(color);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.latestValue}>{displayValue}</Text>
      </View>
      <LineChart
        data={{
          labels: chartData.labels,
          datasets: chartData.datasets,
        }}
        width={chartWidth}
        height={180}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity: number) => `rgba(${rgbColor}, ${opacity})`,
          labelColor: (_opacity: number) => colors.textTertiary,
          propsForDots: {
            r: '3',
            strokeWidth: '1',
            stroke: color,
          },
          propsForBackgroundLines: {
            stroke: colors.borderLight,
            strokeDasharray: '4,4',
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines
        withOuterLines={false}
        withVerticalLines={false}
        fromZero
      />
      {chartData.hasCompare && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>Current</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.textTertiary }]} />
            <Text style={styles.legendText}>Previous</Text>
          </View>
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  title: { ...typography.bodyMedium, color: colors.text },
  latestValue: { ...typography.h3, color: colors.text },
  chart: { marginLeft: -spacing.lg, borderRadius: borderRadius.md },
  emptyChart: {
    height: 180, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...typography.small, color: colors.textSecondary },
});
