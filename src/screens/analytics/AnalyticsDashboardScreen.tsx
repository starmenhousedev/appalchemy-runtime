import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyticsApi } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  DateRangeSelector,
  PRESET_RANGES,
  KPICards,
  MetricLineChart,
  AppInstallsChart,
  TopSourcesChart,
  TopDiscountsChart,
  ConversionFunnelChart,
  TopProductsTable,
  PushInsightsTable,
} from '../../components/analytics';
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

type ChartSection = 'overview' | 'charts' | 'engagement' | 'funnel' | 'products';

export function AnalyticsDashboardScreen() {
  const insets = useSafeAreaInsets();

  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>(PRESET_RANGES[1]); // Last 7 days
  const [compareEnabled, setCompareEnabled] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState<Set<ChartSection>>(
    new Set(['overview', 'charts']),
  );

  const toggleSection = (section: ChartSection) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

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
    const params = buildParams();

    try {
      // Load all in parallel
      const [
        overviewData,
        ordersData,
        salesData,
        convRateData,
        activeData,
        newData,
        sessionsData,
        installsData,
        sourcesData,
        discountsData,
        pushData,
        autoPushData,
        funnelData,
        productsData,
      ] = await Promise.allSettled([
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

      if (overviewData.status === 'fulfilled') setOverview(overviewData.value);
      if (ordersData.status === 'fulfilled') setDailyOrders(ordersData.value);
      if (salesData.status === 'fulfilled') setDailySales(salesData.value);
      if (convRateData.status === 'fulfilled') setConversionRate(convRateData.value);
      if (activeData.status === 'fulfilled') setActiveUsers(activeData.value);
      if (newData.status === 'fulfilled') setNewUsers(newData.value);
      if (sessionsData.status === 'fulfilled') setDailySessions(sessionsData.value);
      if (installsData.status === 'fulfilled') setAppInstalls(installsData.value);
      if (sourcesData.status === 'fulfilled') setTopSources(sourcesData.value);
      if (discountsData.status === 'fulfilled') setTopDiscounts(discountsData.value);
      if (pushData.status === 'fulfilled') setPushInsights(pushData.value);
      if (autoPushData.status === 'fulfilled') setAutomatedPushInsights(autoPushData.value);
      if (funnelData.status === 'fulfilled') setConversionFunnel(funnelData.value);
      if (productsData.status === 'fulfilled') setTopProducts(productsData.value);
    } catch {
      // individual failures handled by allSettled
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      {/* Date Range */}
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

        {/* KPI Cards — always visible */}
        <KPICards data={overview} compareEnabled={compareEnabled} />

        {/* Line Charts Section */}
        <CollapsibleSection
          title="Daily Metrics"
          expanded={expandedSections.has('charts')}
          onToggle={() => toggleSection('charts')}>
          <View style={styles.chartGap}>
            <MetricLineChart
              title="Daily Orders"
              data={dailyOrders}
              compareEnabled={compareEnabled}
              color={colors.primary}
            />
            <MetricLineChart
              title="Daily Sales"
              data={dailySales}
              compareEnabled={compareEnabled}
              color={colors.success}
              formatValue={v => `$${v.toLocaleString()}`}
            />
            <MetricLineChart
              title="Conversion Rate"
              data={conversionRate}
              compareEnabled={compareEnabled}
              color={colors.warning}
              suffix="%"
            />
            <MetricLineChart
              title="Active Users"
              data={activeUsers}
              compareEnabled={compareEnabled}
              color={colors.info}
            />
            <MetricLineChart
              title="New App Users"
              data={newUsers}
              compareEnabled={compareEnabled}
              color={colors.secondary}
            />
            <MetricLineChart
              title="Daily Sessions"
              data={dailySessions}
              compareEnabled={compareEnabled}
              color="#A29BFE"
            />
          </View>
        </CollapsibleSection>

        {/* Engagement Section */}
        <CollapsibleSection
          title="Engagement & Sources"
          expanded={expandedSections.has('engagement')}
          onToggle={() => toggleSection('engagement')}>
          <View style={styles.chartGap}>
            <AppInstallsChart data={appInstalls} />
            <TopSourcesChart data={topSources} />
            <TopDiscountsChart data={topDiscounts} />
            <PushInsightsTable title="Push Notification Insights" data={pushInsights} />
          </View>
        </CollapsibleSection>

        {/* Automated Push */}
        <PushInsightsTable title="Automated Push Insights" data={automatedPushInsights} />

        {/* Conversion Funnel */}
        <CollapsibleSection
          title="Conversion Funnel"
          expanded={expandedSections.has('funnel')}
          onToggle={() => toggleSection('funnel')}>
          <ConversionFunnelChart data={conversionFunnel} />
        </CollapsibleSection>

        {/* Top Products */}
        <CollapsibleSection
          title="Top Products"
          expanded={expandedSections.has('products')}
          onToggle={() => toggleSection('products')}>
          <TopProductsTable data={topProducts} />
        </CollapsibleSection>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

// Collapsible section helper
function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.container}>
      <TouchableOpacity style={sectionStyles.header} onPress={onToggle} activeOpacity={0.7}>
        <Text style={sectionStyles.title}>{title}</Text>
        <Text style={sectionStyles.chevron}>{expanded ? '^' : 'v'}</Text>
      </TouchableOpacity>
      {expanded && children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: { marginTop: spacing.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h4, color: colors.text },
  chevron: { ...typography.body, color: colors.textTertiary, padding: spacing.xs },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h2, color: colors.text },
  dateBar: { padding: spacing.lg, paddingBottom: spacing.sm },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  chartGap: { gap: spacing.md },
});
