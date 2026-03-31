import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyticsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import {
  DateRangeSelector,
  PRESET_RANGES,
  ConversionFunnelChart,
} from '../../components/analytics';
import { Button } from '../../components/common/Button';
import type { DateRange } from '../../components/analytics';
import type { ConversionFunnelStep, AnalyticsQueryParams } from '../../types';

export function ConversionFunnelScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [dateRange, setDateRange] = useState<DateRange>(PRESET_RANGES[1]);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [funnelData, setFunnelData] = useState<ConversionFunnelStep[]>([]);

  const buildParams = useCallback((): AnalyticsQueryParams => {
    const params: AnalyticsQueryParams = {
      date_from: dateRange.date_from,
      date_to: dateRange.date_to,
    };
    if (compareEnabled && dateRange.compare_from && dateRange.compare_to) {
      params.compare_from = dateRange.compare_from;
      params.compare_to = dateRange.compare_to;
    }
    return params;
  }, [dateRange, compareEnabled]);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await analyticsApi.conversionFunnel(buildParams());
      setFunnelData(data);
    } catch {
      showToast('error', 'Failed to load funnel data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const overallConversion = funnelData.length >= 2
    ? ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(2)
    : '0';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Conversion Funnel</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.dateBar}>
        <DateRangeSelector
          selectedRange={dateRange}
          onSelectRange={setDateRange}
          compareEnabled={compareEnabled}
          onToggleCompare={setCompareEnabled}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Overall Conversion Rate</Text>
          <Text style={styles.summaryValue}>{overallConversion}%</Text>
          {funnelData.length >= 2 && (
            <Text style={styles.summaryDetail}>
              {funnelData[0].count.toLocaleString()} sessions
              {' -> '}
              {funnelData[funnelData.length - 1].count.toLocaleString()} purchases
            </Text>
          )}
        </View>

        {/* Funnel Chart */}
        <ConversionFunnelChart data={funnelData} />

        {/* Step Details */}
        {funnelData.length > 1 && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Step-by-Step Breakdown</Text>
            {funnelData.map((step, index) => {
              const prevCount = index > 0 ? funnelData[index - 1].count : step.count;
              const dropOff = index > 0 ? prevCount - step.count : 0;
              const dropPct = index > 0 && prevCount > 0
                ? ((dropOff / prevCount) * 100).toFixed(1)
                : null;

              return (
                <View key={step.step} style={styles.detailRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepDetail}>
                    <Text style={styles.stepName}>{step.step.replace(/_/g, ' ')}</Text>
                    <Text style={styles.stepCount}>{step.count.toLocaleString()} users</Text>
                  </View>
                  {dropPct !== null && (
                    <View style={styles.dropBadge}>
                      <Text style={styles.dropText}>-{dropPct}%</Text>
                      <Text style={styles.dropCount}>{dropOff.toLocaleString()} lost</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  headerTitle: { ...typography.h4, color: colors.text },
  dateBar: { padding: spacing.lg, paddingBottom: spacing.sm },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  summaryCard: {
    backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    padding: spacing.xl, marginBottom: spacing.lg, alignItems: 'center',
  },
  summaryLabel: { ...typography.captionMedium, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xs },
  summaryValue: { fontSize: 40, fontWeight: '700', color: '#fff' },
  summaryDetail: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs },
  detailsCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginTop: spacing.lg, ...shadows.sm,
  },
  detailsTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.lg },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight,
  },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center',
  },
  stepNumberText: { ...typography.captionMedium, color: colors.primary },
  stepDetail: { flex: 1 },
  stepName: { ...typography.captionMedium, color: colors.text, textTransform: 'capitalize' },
  stepCount: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  dropBadge: { alignItems: 'flex-end' },
  dropText: { ...typography.captionMedium, color: colors.error },
  dropCount: { ...typography.small, color: colors.textTertiary },
});
