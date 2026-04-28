import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyticsApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { SectionCard } from '../../components/common/SectionCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { DateRangeSelector, PRESET_RANGES, ConversionFunnelChart } from '../../components/analytics';
import type { DateRange } from '../../components/analytics';
import type { ConversionFunnelStep, AnalyticsQueryParams } from '../../types';

export function ConversionFunnelScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [dateRange, setDateRange] = useState<DateRange>(PRESET_RANGES[1]);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [funnelData, setFunnelData] = useState<ConversionFunnelStep[]>([]);

  const buildParams = useCallback((): AnalyticsQueryParams => {
    const params: AnalyticsQueryParams = { date_from: dateRange.date_from, date_to: dateRange.date_to };
    if (compareEnabled && dateRange.compare_from && dateRange.compare_to) {
      params.compare_from = dateRange.compare_from;
      params.compare_to = dateRange.compare_to;
    }
    return params;
  }, [dateRange, compareEnabled]);

  const loadData = useCallback(
    async (isRefresh = false) => {
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
    },
    [buildParams, showToast],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const overallConversion = useMemo(
    () =>
      funnelData.length >= 2 && funnelData[0].count > 0
        ? ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(2)
        : '0',
    [funnelData],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        dateBar: { padding: theme.spacing.lg, paddingBottom: theme.spacing.sm },
        content: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.md },
        summaryCard: {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          alignItems: 'center',
          ...theme.shadows.md,
        },
        summaryLabel: { ...theme.typography.captionMedium, color: 'rgba(255,255,255,0.85)' },
        summaryValue: { fontSize: 40, fontWeight: '700', color: '#fff', marginTop: theme.spacing.xs },
        summaryDetail: { ...theme.typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: theme.spacing.xs },
        detailRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.divider,
        },
        stepNumber: {
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: theme.colors.primarySoft,
          justifyContent: 'center',
          alignItems: 'center',
        },
        stepNumberText: { ...theme.typography.captionMedium, color: theme.colors.primary, fontWeight: '700' },
        stepName: { ...theme.typography.captionMedium, color: theme.colors.text, textTransform: 'capitalize' },
        stepCount: { ...theme.typography.small, color: theme.colors.textTertiary, marginTop: 1 },
        dropText: { ...theme.typography.captionMedium, color: theme.colors.error },
        dropCount: { ...theme.typography.small, color: theme.colors.textTertiary },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Conversion Funnel" subtitle={dateRange.label} onBack={() => navigation.goBack()} />
      <View style={styles.dateBar}>
        <DateRangeSelector
          selectedRange={dateRange}
          onSelectRange={setDateRange}
          compareEnabled={compareEnabled}
          onToggleCompare={setCompareEnabled}
        />
      </View>
      {loading && funnelData.length === 0 ? (
        <LoadingState message="Loading funnel…" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData(true);
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Overall Conversion Rate</Text>
            <Text style={styles.summaryValue}>{overallConversion}%</Text>
            {funnelData.length >= 2 ? (
              <Text style={styles.summaryDetail}>
                {funnelData[0].count.toLocaleString()} sessions → {funnelData[funnelData.length - 1].count.toLocaleString()} purchases
              </Text>
            ) : null}
          </View>

          {funnelData.length === 0 ? (
            <EmptyState icon="↘" title="No funnel data" description="Once shoppers start moving through your store, the steps appear here." />
          ) : (
            <SectionCard title="Funnel">
              <ConversionFunnelChart data={funnelData} />
            </SectionCard>
          )}

          {funnelData.length > 1 ? (
            <SectionCard title="Step-by-step breakdown">
              {funnelData.map((step, index) => {
                const prevCount = index > 0 ? funnelData[index - 1].count : step.count;
                const dropOff = index > 0 ? prevCount - step.count : 0;
                const dropPct = index > 0 && prevCount > 0 ? ((dropOff / prevCount) * 100).toFixed(1) : null;
                return (
                  <View key={step.step} style={styles.detailRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepName}>{step.step.replace(/_/g, ' ')}</Text>
                      <Text style={styles.stepCount}>{step.count.toLocaleString()} users</Text>
                    </View>
                    {dropPct !== null ? (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.dropText}>−{dropPct}%</Text>
                        <Text style={styles.dropCount}>{dropOff.toLocaleString()} lost</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </SectionCard>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
