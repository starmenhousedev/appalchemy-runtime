import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { analyticsApi } from '../../api';
import { useTheme } from '../../theme';
import {
  SectionCard,
  EmptyState,
  LoadingState,
  ActionButton,
  FilterChips,
} from '../../components/common';
import { AppHeader } from '../../components/common/AppHeader';
import {
  DateRangeSelector,
  PRESET_RANGES,
  MetricLineChart,
  AppInstallsChart,
  TopSourcesChart,
  TopDiscountsChart,
  ConversionFunnelChart,
  TopProductsTable,
  PushInsightsTable,
} from '../../components/analytics';
import { safeNumber } from '../../components/analytics/utils';
import type { DateRange } from '../../components/analytics';
import type {
  AnalyticsOverview,
  DailyMetric,
  AppInstallData,
  TopSource,
  TopDiscount,
  PushInsight,
  ConversionFunnelStep,
  TopProduct,
  AnalyticsQueryParams,
} from '../../types';
import type { DrawerParamList } from '../../navigation/types';

type Nav = DrawerNavigationProp<DrawerParamList>;
type Platform = 'all' | 'android' | 'ios';

const formatNumber = (v: number | null | undefined): string => {
  const n = safeNumber(v);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};
const formatCurrency = (v: number | null | undefined): string => `$${formatNumber(v)}`;

const computeChange = (
  cur?: number,
  prev?: number,
): { trend: 'up' | 'down' | 'neutral'; label: string } => {
  const c = safeNumber(cur);
  const p = safeNumber(prev);
  if (p === 0 && c === 0) return { trend: 'neutral', label: '0%' };
  if (p === 0) return { trend: 'up', label: '+100%' };
  const pct = ((c - p) / p) * 100;
  return {
    trend: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
    label: `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`,
  };
};

interface MiniKpiProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accent: 'success' | 'primary' | 'info' | 'warning' | 'secondary' | 'error';
}

function MiniKpi({ label, value, trend, trendLabel, accent }: MiniKpiProps) {
  const theme = useTheme();
  const accentColor = theme.colors[accent] ?? theme.colors.primary;
  const trendColor =
    trend === 'up'
      ? theme.colors.success
      : trend === 'down'
      ? theme.colors.error
      : theme.colors.textSecondary;
  const trendSymbol = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '–';

  return (
    <View
      style={[
        miniStyles.tile,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          padding: theme.spacing.md,
        },
      ]}>
      <View style={[miniStyles.bar, { backgroundColor: accentColor }]} />
      <Text
        style={[
          theme.typography.small,
          {
            color: theme.colors.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            fontWeight: '700',
          },
        ]}
        numberOfLines={1}>
        {label}
      </Text>
      <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]} numberOfLines={1}>
        {value}
      </Text>
      {trendLabel ? (
        <Text style={[theme.typography.small, { color: trendColor, fontWeight: '700', marginTop: 2 }]}>
          {trendSymbol} {trendLabel}
        </Text>
      ) : (
        <Text style={[theme.typography.small, { color: theme.colors.textTertiary, marginTop: 2 }]}>—</Text>
      )}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  tile: { width: 140, overflow: 'hidden' },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
});

export function AnalyticsDashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [dateRange, setDateRange] = useState<DateRange>(PRESET_RANGES[1]);
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [platform, setPlatform] = useState<Platform>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [dailyOrders, setDailyOrders] = useState<DailyMetric[]>([]);
  const [dailySales, setDailySales] = useState<DailyMetric[]>([]);
  const [conversionRate, setConversionRate] = useState<DailyMetric[]>([]);
  const [activeUsers, setActiveUsers] = useState<DailyMetric[]>([]);
  const [newUsers, setNewUsers] = useState<DailyMetric[]>([]);
  const [dailySessions, setDailySessions] = useState<DailyMetric[]>([]);
  const [appInstalls, setAppInstalls] = useState<AppInstallData[]>([]);
  const [topSources, setTopSources] = useState<TopSource[]>([]);
  const [topDiscounts, setTopDiscounts] = useState<TopDiscount[]>([]);
  const [pushInsights, setPushInsights] = useState<PushInsight[]>([]);
  const [automatedPushInsights, setAutomatedPushInsights] = useState<PushInsight[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelStep[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const buildParams = useCallback((): AnalyticsQueryParams => {
    const params: AnalyticsQueryParams = {
      date_from: dateRange.date_from,
      date_to: dateRange.date_to,
    };
    if (compareEnabled && dateRange.compare_from && dateRange.compare_to) {
      params.compare_from = dateRange.compare_from;
      params.compare_to = dateRange.compare_to;
    }
    if (platform !== 'all') params.platform = platform;
    return params;
  }, [dateRange, compareEnabled, platform]);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      const params = buildParams();
      try {
        const results = await Promise.allSettled([
          analyticsApi.overview(params),
          analyticsApi.dailyOrders(params),
          analyticsApi.dailySales(params),
          analyticsApi.conversionRate(params),
          analyticsApi.activeUsers(params),
          analyticsApi.newUsers(params),
          analyticsApi.dailySessions(params),
          analyticsApi.appInstalls(params),
          analyticsApi.topSources(params),
          analyticsApi.topDiscounts(params),
          analyticsApi.pushInsights(params),
          analyticsApi.automatedPushInsights(params),
          analyticsApi.conversionFunnel(params),
          analyticsApi.topProducts(params),
        ]);
        const [
          overviewRes,
          ordersRes,
          salesRes,
          convRateRes,
          activeRes,
          newRes,
          sessionsRes,
          installsRes,
          sourcesRes,
          discountsRes,
          pushRes,
          autoPushRes,
          funnelRes,
          productsRes,
        ] = results;
        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
        if (ordersRes.status === 'fulfilled') setDailyOrders(ordersRes.value);
        if (salesRes.status === 'fulfilled') setDailySales(salesRes.value);
        if (convRateRes.status === 'fulfilled') setConversionRate(convRateRes.value);
        if (activeRes.status === 'fulfilled') setActiveUsers(activeRes.value);
        if (newRes.status === 'fulfilled') setNewUsers(newRes.value);
        if (sessionsRes.status === 'fulfilled') setDailySessions(sessionsRes.value);
        if (installsRes.status === 'fulfilled') setAppInstalls(installsRes.value);
        if (sourcesRes.status === 'fulfilled') setTopSources(sourcesRes.value);
        if (discountsRes.status === 'fulfilled') setTopDiscounts(discountsRes.value);
        if (pushRes.status === 'fulfilled') setPushInsights(pushRes.value);
        if (autoPushRes.status === 'fulfilled') setAutomatedPushInsights(autoPushRes.value);
        if (funnelRes.status === 'fulfilled') setConversionFunnel(funnelRes.value);
        if (productsRes.status === 'fulfilled') setTopProducts(productsRes.value);
        setLastUpdated(Date.now());
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const totalSalesChange = computeChange(overview?.total_sales, overview?.comparison?.total_sales);
  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return 'Updating…';
    const diffSec = Math.floor((Date.now() - lastUpdated) / 1000);
    if (diffSec < 5) return 'Updated just now';
    if (diffSec < 60) return `Updated ${diffSec}s ago`;
    const m = Math.floor(diffSec / 60);
    return `Updated ${m}m ago`;
  }, [lastUpdated, refreshing]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        // Report bar (compact, sticky-feel)
        reportBar: {
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.borderLight,
          gap: theme.spacing.sm,
        },
        updatedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        updatedText: { ...theme.typography.small, color: theme.colors.textTertiary },
        scroll: {
          paddingBottom: theme.spacing.xxxl + insets.bottom,
          gap: theme.spacing.md,
        },
        scrollPadding: { paddingHorizontal: theme.spacing.lg },
        // Headline metric card
        headlineCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          padding: theme.spacing.lg,
          ...theme.shadows.sm,
        },
        headlineLabel: {
          ...theme.typography.small,
          color: theme.colors.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontWeight: '700',
        },
        headlineRow: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.sm, marginTop: 4 },
        headlineValue: { fontSize: 36, lineHeight: 40, fontWeight: '700', color: theme.colors.text },
        headlineTrendText: { ...theme.typography.bodyMedium, fontWeight: '700' },
        headlineHint: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
        },
        // KPI strip (horizontal scroll, distinct from Dashboard's grid)
        kpiStrip: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm, paddingVertical: theme.spacing.xs },
        // Section label (clinical, uppercase)
        sectionLabel: {
          ...theme.typography.captionMedium,
          color: theme.colors.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
          marginTop: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        },
        chartGap: { gap: theme.spacing.md },
      }),
    [theme, insets.bottom],
  );

  const showInitialLoading = loading && !overview;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Analytics"
        subtitle={`${dateRange.label} · ${platform === 'all' ? 'All platforms' : platform === 'android' ? 'Android' : 'iOS'}`}
        onMenu={() => navigation.openDrawer()}
        right={
          <ActionButton
            label={compareEnabled ? 'Compare on' : 'Compare'}
            variant={compareEnabled ? 'primary' : 'outline'}
            size="sm"
            onPress={() => setCompareEnabled(v => !v)}
          />
        }
      />

      {/* Compact report bar */}
      <View style={styles.reportBar}>
        <DateRangeSelector
          selectedRange={dateRange}
          onSelectRange={setDateRange}
          compareEnabled={compareEnabled}
          onToggleCompare={setCompareEnabled}
        />
        <FilterChips
          value={platform}
          onChange={v => setPlatform(v as Platform)}
          options={[
            { label: 'All platforms', value: 'all' },
            { label: 'Android', value: 'android' },
            { label: 'iOS', value: 'ios' },
          ]}
        />
        <View style={styles.updatedRow}>
          <Text style={styles.updatedText}>{lastUpdatedLabel}</Text>
          <Text style={styles.updatedText}>Pull to refresh</Text>
        </View>
      </View>

      {showInitialLoading ? (
        <LoadingState message="Loading report…" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}>
          {/* HEADLINE METRIC — single big number, period-comparison-first */}
          <View style={[styles.scrollPadding, { paddingTop: theme.spacing.md }]}>
            <View style={styles.headlineCard}>
              <Text style={styles.headlineLabel}>Total sales · {dateRange.label}</Text>
              <View style={styles.headlineRow}>
                <Text style={styles.headlineValue}>{formatCurrency(overview?.total_sales)}</Text>
                {compareEnabled ? (
                  <Text
                    style={[
                      styles.headlineTrendText,
                      {
                        color:
                          totalSalesChange.trend === 'up'
                            ? theme.colors.success
                            : totalSalesChange.trend === 'down'
                            ? theme.colors.error
                            : theme.colors.textSecondary,
                      },
                    ]}>
                    {totalSalesChange.trend === 'up' ? '▲' : totalSalesChange.trend === 'down' ? '▼' : '–'}{' '}
                    {totalSalesChange.label}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.headlineHint}>
                {formatNumber(overview?.total_orders)} orders ·{' '}
                {(safeNumber(overview?.conversion_rate)).toFixed(1)}% conversion ·{' '}
                {formatCurrency(overview?.average_order_value)} avg order
              </Text>
            </View>
          </View>

          {/* KPI STRIP — horizontal scroll (distinct visual pattern from Dashboard) */}
          <Text style={styles.sectionLabel}>All metrics</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kpiStrip}>
            <MiniKpi
              label="Sales"
              value={formatCurrency(overview?.total_sales)}
              accent="success"
              {...(compareEnabled
                ? {
                    trend: computeChange(overview?.total_sales, overview?.comparison?.total_sales).trend,
                    trendLabel: computeChange(overview?.total_sales, overview?.comparison?.total_sales).label,
                  }
                : {})}
            />
            <MiniKpi
              label="Orders"
              value={formatNumber(overview?.total_orders)}
              accent="primary"
              {...(compareEnabled
                ? {
                    trend: computeChange(overview?.total_orders, overview?.comparison?.total_orders).trend,
                    trendLabel: computeChange(overview?.total_orders, overview?.comparison?.total_orders).label,
                  }
                : {})}
            />
            <MiniKpi
              label="Avg Order"
              value={formatCurrency(overview?.average_order_value)}
              accent="secondary"
              {...(compareEnabled
                ? {
                    trend: computeChange(overview?.average_order_value, overview?.comparison?.average_order_value).trend,
                    trendLabel: computeChange(overview?.average_order_value, overview?.comparison?.average_order_value).label,
                  }
                : {})}
            />
            <MiniKpi
              label="Conversion"
              value={`${safeNumber(overview?.conversion_rate).toFixed(1)}%`}
              accent="warning"
              {...(compareEnabled
                ? {
                    trend: computeChange(overview?.conversion_rate, overview?.comparison?.conversion_rate).trend,
                    trendLabel: computeChange(overview?.conversion_rate, overview?.comparison?.conversion_rate).label,
                  }
                : {})}
            />
            <MiniKpi
              label="Active Users"
              value={formatNumber(overview?.active_users)}
              accent="info"
              {...(compareEnabled
                ? {
                    trend: computeChange(overview?.active_users, overview?.comparison?.active_users).trend,
                    trendLabel: computeChange(overview?.active_users, overview?.comparison?.active_users).label,
                  }
                : {})}
            />
            <MiniKpi
              label="New Users"
              value={formatNumber(overview?.new_app_users)}
              accent="primary"
              {...(compareEnabled
                ? {
                    trend: computeChange(overview?.new_app_users, overview?.comparison?.new_app_users).trend,
                    trendLabel: computeChange(overview?.new_app_users, overview?.comparison?.new_app_users).label,
                  }
                : {})}
            />
          </ScrollView>

          {/* SALES & ORDERS */}
          <Text style={styles.sectionLabel}>Sales & orders</Text>
          <View style={styles.scrollPadding}>
            <SectionCard contentStyle={styles.chartGap}>
              <MetricLineChart
                title="Daily Sales"
                data={dailySales}
                compareEnabled={compareEnabled}
                color={theme.colors.success}
                formatValue={v => `$${v.toLocaleString()}`}
              />
              <MetricLineChart
                title="Daily Orders"
                data={dailyOrders}
                compareEnabled={compareEnabled}
                color={theme.colors.primary}
              />
              <MetricLineChart
                title="Conversion Rate"
                data={conversionRate}
                compareEnabled={compareEnabled}
                color={theme.colors.warning}
                suffix="%"
              />
            </SectionCard>
          </View>

          {/* AUDIENCE */}
          <Text style={styles.sectionLabel}>Audience</Text>
          <View style={styles.scrollPadding}>
            <SectionCard contentStyle={styles.chartGap}>
              <MetricLineChart
                title="Active Users"
                data={activeUsers}
                compareEnabled={compareEnabled}
                color={theme.colors.info}
              />
              <MetricLineChart
                title="New App Users"
                data={newUsers}
                compareEnabled={compareEnabled}
                color={theme.colors.secondary}
              />
              <MetricLineChart
                title="Daily Sessions"
                data={dailySessions}
                compareEnabled={compareEnabled}
                color={theme.colors.primaryLight}
              />
              <AppInstallsChart data={appInstalls} />
            </SectionCard>
          </View>

          {/* ACQUISITION & PROMOS */}
          <Text style={styles.sectionLabel}>Acquisition & promos</Text>
          <View style={styles.scrollPadding}>
            <SectionCard contentStyle={styles.chartGap}>
              <TopSourcesChart data={topSources} />
              <TopDiscountsChart data={topDiscounts} />
            </SectionCard>
          </View>

          {/* CONVERSION */}
          <Text style={styles.sectionLabel}>Conversion</Text>
          <View style={styles.scrollPadding}>
            <SectionCard
              title="Funnel"
              subtitle="From visit to purchase"
              action={{
                label: 'Open',
                onPress: () => navigation.navigate('Analytics', { screen: 'ConversionFunnel' } as any),
              }}>
              {conversionFunnel.length === 0 ? (
                <EmptyState
                  icon="↘"
                  title="No funnel data"
                  description="Once shoppers start moving through your store, the steps appear here."
                  compact
                />
              ) : (
                <ConversionFunnelChart data={conversionFunnel} />
              )}
            </SectionCard>
          </View>

          {/* PUSH PERFORMANCE */}
          <Text style={styles.sectionLabel}>Push performance</Text>
          <View style={styles.scrollPadding}>
            <SectionCard contentStyle={styles.chartGap}>
              <PushInsightsTable title="Manual campaigns" data={pushInsights} />
              <PushInsightsTable title="Automated campaigns" data={automatedPushInsights} />
            </SectionCard>
          </View>

          {/* TOP PRODUCTS */}
          <Text style={styles.sectionLabel}>Top performers</Text>
          <View style={styles.scrollPadding}>
            <SectionCard
              title="Top products"
              action={{
                label: 'See all',
                onPress: () => navigation.navigate('Analytics', { screen: 'TopProducts' } as any),
              }}
              padded={false}>
              {topProducts.length === 0 ? (
                <EmptyState icon="◇" title="No product data" compact />
              ) : (
                <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg }}>
                  <TopProductsTable data={topProducts.slice(0, 10)} />
                </View>
              )}
            </SectionCard>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
