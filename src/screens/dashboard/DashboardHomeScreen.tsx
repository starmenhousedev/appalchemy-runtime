import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { analyticsApi, themesApi, discountsApi, pushApi, publishApi } from '../../api';
import { useTheme } from '../../theme';
import { useStore } from '../../store';
import {
  EmptyState,
  LoadingState,
  StatusBadge,
} from '../../components/common';
import { AppHeader } from '../../components/common/AppHeader';
import type {
  AnalyticsOverview,
  PushInsight,
  ImportedTheme,
  Discount,
  PushNotification,
  Build,
} from '../../types';
import type { DrawerParamList } from '../../navigation/types';

type Nav = DrawerNavigationProp<DrawerParamList>;

const todayISO = () => new Date().toISOString().split('T')[0];

const formatNumber = (v: number | null | undefined): string => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};
const formatCurrency = (v: number | null | undefined): string => `$${formatNumber(v)}`;

interface ActivityItem {
  id: string;
  glyph: string;
  title: string;
  subtitle: string;
  timestamp: number;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
}

const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export function DashboardHomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const shop = useStore(s => s.shop);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todaySales, setTodaySales] = useState<number>(0);
  const [todayOrders, setTodayOrders] = useState<number>(0);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [importedThemes, setImportedThemes] = useState<ImportedTheme[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [pushList, setPushList] = useState<PushNotification[]>([]);
  const [pushInsights, setPushInsights] = useState<PushInsight[]>([]);
  const [latestBuild, setLatestBuild] = useState<Build | null>(null);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      const today = todayISO();
      const last30 = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0];
      try {
        const [salesRes, ordersRes, overviewRes, themesRes, discountsRes, pushRes, pushSentRes, insightsRes, buildsRes] =
          await Promise.allSettled([
            analyticsApi.dailySales({ date_from: today, date_to: today }),
            analyticsApi.dailyOrders({ date_from: today, date_to: today }),
            analyticsApi.overview({ date_from: last30, date_to: today }),
            themesApi.listImported(),
            discountsApi.list(),
            pushApi.list('scheduled'),
            pushApi.list('sent'),
            analyticsApi.pushInsights({ date_from: last30, date_to: today }),
            publishApi.listBuilds(),
          ]);

        if (salesRes.status === 'fulfilled') {
          const arr = salesRes.value;
          setTodaySales(Array.isArray(arr) ? arr.reduce((s, p) => s + (p.value ?? 0), 0) : 0);
        }
        if (ordersRes.status === 'fulfilled') {
          const arr = ordersRes.value;
          setTodayOrders(Array.isArray(arr) ? arr.reduce((s, p) => s + (p.value ?? 0), 0) : 0);
        }
        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
        if (themesRes.status === 'fulfilled') setImportedThemes(Array.isArray(themesRes.value) ? themesRes.value : []);
        if (discountsRes.status === 'fulfilled') setDiscounts(Array.isArray(discountsRes.value) ? discountsRes.value : []);

        const sched = pushRes.status === 'fulfilled' ? pushRes.value : [];
        const sent = pushSentRes.status === 'fulfilled' ? pushSentRes.value : [];
        setPushList([...(Array.isArray(sched) ? sched : []), ...(Array.isArray(sent) ? sent : [])]);

        if (insightsRes.status === 'fulfilled') setPushInsights(insightsRes.value);
        if (buildsRes.status === 'fulfilled') {
          const builds = Array.isArray(buildsRes.value) ? buildsRes.value : [];
          setLatestBuild(builds[0] ?? null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const activeTheme = importedThemes.find(t => t.is_active) ?? null;
  const activeDiscounts = discounts.filter(d => d.is_active).length;
  const scheduledPushCount = pushList.filter(p => p.status === 'scheduled').length;

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    importedThemes
      .filter(t => t.is_active && t.updatedAt)
      .forEach(t => {
        items.push({
          id: `theme-${t.id}`,
          glyph: '◫',
          title: `${t.name} is the active theme`,
          subtitle: `Activated ${relativeTime(new Date(t.updatedAt).getTime())}`,
          timestamp: new Date(t.updatedAt).getTime(),
          tone: 'primary',
        });
      });

    pushList
      .filter(p => p.status === 'sent' && p.updatedAt)
      .slice(0, 3)
      .forEach(p => {
        items.push({
          id: `push-${p.id}`,
          glyph: '⌘',
          title: `Push sent: ${p.title || 'Untitled'}`,
          subtitle: relativeTime(new Date(p.updatedAt).getTime()),
          timestamp: new Date(p.updatedAt).getTime(),
          tone: 'info',
        });
      });

    discounts
      .filter(d => d.createdAt)
      .slice(0, 3)
      .forEach(d => {
        items.push({
          id: `discount-${d.id}`,
          glyph: '%',
          title: `Discount: ${d.title || 'Untitled'}`,
          subtitle: `${d.is_active ? 'Active' : 'Paused'} · created ${relativeTime(new Date(d.createdAt).getTime())}`,
          timestamp: new Date(d.createdAt).getTime(),
          tone: d.is_active ? 'success' : 'neutral',
        });
      });

    if (latestBuild?.createdAt) {
      items.push({
        id: `build-${latestBuild.id}`,
        glyph: '↑',
        title: `Build v${latestBuild.version} · ${latestBuild.status}`,
        subtitle: relativeTime(new Date(latestBuild.createdAt).getTime()),
        timestamp: new Date(latestBuild.createdAt).getTime(),
        tone:
          latestBuild.status === 'completed'
            ? 'success'
            : latestBuild.status === 'failed'
            ? 'warning'
            : 'info',
      });
    }

    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  }, [importedThemes, pushList, discounts, latestBuild]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        scroll: {
          paddingBottom: theme.spacing.xxxl + insets.bottom,
          gap: theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
        },
        // Hero
        hero: {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          ...theme.shadows.md,
          overflow: 'hidden',
        },
        heroDecor: {
          position: 'absolute',
          right: -40,
          top: -40,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        heroDecor2: {
          position: 'absolute',
          right: 24,
          bottom: -36,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: 'rgba(255,255,255,0.06)',
        },
        heroGreeting: { ...theme.typography.caption, color: 'rgba(255,255,255,0.85)' },
        heroName: { ...theme.typography.h2, color: '#fff', marginTop: 4 },
        heroShop: { ...theme.typography.captionMedium, color: 'rgba(255,255,255,0.85)', marginTop: theme.spacing.xs },
        heroBadgeRow: { flexDirection: 'row', marginTop: theme.spacing.md, gap: 8 },
        heroBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(255,255,255,0.18)',
          paddingHorizontal: theme.spacing.sm + 2,
          paddingVertical: 4,
          borderRadius: theme.borderRadius.round,
        },
        heroBadgeText: { ...theme.typography.small, color: '#fff', fontWeight: '600' },
        heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' },
        // Today snapshot strip
        todayStrip: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.shadows.sm,
        },
        todayCol: {
          flex: 1,
          alignItems: 'flex-start',
          paddingHorizontal: theme.spacing.xs,
        },
        todayDivider: { width: StyleSheet.hairlineWidth, backgroundColor: theme.colors.divider },
        todayLabel: {
          ...theme.typography.small,
          color: theme.colors.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        todayValue: { ...theme.typography.h3, color: theme.colors.text, marginTop: 2 },
        // Section header
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.xs,
        },
        sectionTitle: { ...theme.typography.h4, color: theme.colors.text },
        sectionLink: { ...theme.typography.captionMedium, color: theme.colors.primary },
        // Quick actions
        quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
        quickTile: {
          flexBasis: '48%',
          flexGrow: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.borderLight,
          minHeight: 96,
          ...theme.shadows.sm,
        },
        quickGlyph: {
          width: 38,
          height: 38,
          borderRadius: theme.borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        quickGlyphText: { fontSize: 18, fontWeight: '700' },
        quickLabel: { ...theme.typography.bodyMedium, color: theme.colors.text },
        quickHint: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 2 },
        // Store status grid
        storeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
        storeCard: {
          flexBasis: '48%',
          flexGrow: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
        },
        storeRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
        storeIcon: {
          width: 32,
          height: 32,
          borderRadius: theme.borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        storeIconText: { fontSize: 14, fontWeight: '700' },
        storeLabel: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          flex: 1,
        },
        storeValue: { ...theme.typography.h3, color: theme.colors.text, marginTop: theme.spacing.sm },
        storeFootnote: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
        storeCta: { ...theme.typography.captionMedium, color: theme.colors.primary, marginTop: theme.spacing.sm },
        // Activity timeline
        timelineCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
          padding: theme.spacing.md,
        },
        activityRow: { flexDirection: 'row', gap: theme.spacing.md, paddingVertical: theme.spacing.sm },
        activityIcon: {
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
        },
        activityIconText: { fontSize: 14, fontWeight: '700' },
        activityTitle: { ...theme.typography.bodyMedium, color: theme.colors.text },
        activitySubtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
      }),
    [theme, insets.bottom],
  );

  const quickActions: { label: string; hint: string; glyph: string; tone: 'primary' | 'success' | 'info' | 'secondary' | 'warning'; onPress: () => void }[] = [
    {
      label: 'Edit Theme',
      hint: 'Pages & sections',
      glyph: '◫',
      tone: 'primary',
      onPress: () => navigation.navigate('Design', { screen: 'ThemeEditor' } as any),
    },
    {
      label: 'View Analytics',
      hint: 'Insights & charts',
      glyph: '◔',
      tone: 'info',
      onPress: () => navigation.navigate('Analytics', { screen: 'AnalyticsDashboard' } as any),
    },
    {
      label: 'Create Discount',
      hint: 'New promotion',
      glyph: '%',
      tone: 'success',
      onPress: () => navigation.navigate('Discounts', { screen: 'DiscountForm', params: {} } as any),
    },
    {
      label: 'Send Push',
      hint: 'New campaign',
      glyph: '⌘',
      tone: 'warning',
      onPress: () => navigation.navigate('Push', { screen: 'PushForm', params: {} } as any),
    },
  ];

  const buildStatusTone: 'success' | 'info' | 'warning' | 'error' | 'neutral' =
    !latestBuild
      ? 'neutral'
      : latestBuild.status === 'completed'
      ? 'success'
      : latestBuild.status === 'failed'
      ? 'error'
      : latestBuild.status === 'building'
      ? 'info'
      : 'warning';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Dashboard"
        subtitle="Your control center"
        onMenu={() => navigation.openDrawer()}
      />

      {loading && !overview ? (
        <LoadingState message="Loading your dashboard…" />
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

          {/* HERO */}
          <View style={styles.hero}>
            <View style={styles.heroDecor} />
            <View style={styles.heroDecor2} />
            <Text style={styles.heroGreeting}>{greeting},</Text>
            <Text style={styles.heroName} numberOfLines={1}>
              {shop?.shop_name || 'Welcome back'}
            </Text>
            {shop?.shop_domain ? (
              <Text style={styles.heroShop} numberOfLines={1}>
                {shop.shop_domain}
              </Text>
            ) : null}
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <View style={styles.heroDot} />
                <Text style={styles.heroBadgeText}>Connected</Text>
              </View>
              {activeTheme ? (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{activeTheme.name} live</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* TODAY SNAPSHOT */}
          <View style={styles.todayStrip}>
            <View style={styles.todayCol}>
              <Text style={styles.todayLabel}>Today's revenue</Text>
              <Text style={styles.todayValue}>{formatCurrency(todaySales)}</Text>
            </View>
            <View style={styles.todayDivider} />
            <View style={styles.todayCol}>
              <Text style={styles.todayLabel}>Today's orders</Text>
              <Text style={styles.todayValue}>{formatNumber(todayOrders)}</Text>
            </View>
            <View style={styles.todayDivider} />
            <View style={styles.todayCol}>
              <Text style={styles.todayLabel}>Conversion</Text>
              <Text style={styles.todayValue}>{(overview?.conversion_rate ?? 0).toFixed(1)}%</Text>
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick actions</Text>
            </View>
            <View style={styles.quickGrid}>
              {quickActions.map(action => {
                const accent = theme.colors[action.tone] ?? theme.colors.primary;
                return (
                  <TouchableOpacity
                    key={action.label}
                    style={styles.quickTile}
                    activeOpacity={0.85}
                    onPress={action.onPress}>
                    <View style={[styles.quickGlyph, { backgroundColor: accent + '22' }]}>
                      <Text style={[styles.quickGlyphText, { color: accent }]}>{action.glyph}</Text>
                    </View>
                    <Text style={styles.quickLabel} numberOfLines={1}>
                      {action.label}
                    </Text>
                    <Text style={styles.quickHint} numberOfLines={1}>
                      {action.hint}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* STORE STATUS */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your store at a glance</Text>
            </View>
            <View style={styles.storeGrid}>
              {/* Active Theme */}
              <TouchableOpacity
                style={styles.storeCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('More', { screen: 'ManageThemes' } as any)
                }>
                <View style={styles.storeRow}>
                  <View style={[styles.storeIcon, { backgroundColor: theme.colors.primarySoft }]}>
                    <Text style={[styles.storeIconText, { color: theme.colors.primary }]}>◫</Text>
                  </View>
                  <Text style={styles.storeLabel} numberOfLines={1}>
                    Active theme
                  </Text>
                </View>
                <Text style={styles.storeValue} numberOfLines={1}>
                  {activeTheme?.name ?? 'None'}
                </Text>
                <Text style={styles.storeFootnote}>
                  {importedThemes.length} imported · {importedThemes.filter(t => t.is_pinned).length} pinned
                </Text>
                <Text style={styles.storeCta}>Manage themes →</Text>
              </TouchableOpacity>

              {/* Discounts */}
              <TouchableOpacity
                style={styles.storeCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Discounts', { screen: 'DiscountList' } as any)}>
                <View style={styles.storeRow}>
                  <View style={[styles.storeIcon, { backgroundColor: theme.colors.successLight }]}>
                    <Text style={[styles.storeIconText, { color: theme.colors.success }]}>%</Text>
                  </View>
                  <Text style={styles.storeLabel} numberOfLines={1}>
                    Discounts
                  </Text>
                </View>
                <Text style={styles.storeValue}>{activeDiscounts}</Text>
                <Text style={styles.storeFootnote}>
                  active · {discounts.length - activeDiscounts} paused
                </Text>
                <Text style={styles.storeCta}>Manage discounts →</Text>
              </TouchableOpacity>

              {/* Push */}
              <TouchableOpacity
                style={styles.storeCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Push', { screen: 'PushList' } as any)}>
                <View style={styles.storeRow}>
                  <View style={[styles.storeIcon, { backgroundColor: theme.colors.warningLight }]}>
                    <Text style={[styles.storeIconText, { color: theme.colors.warning }]}>⌘</Text>
                  </View>
                  <Text style={styles.storeLabel} numberOfLines={1}>
                    Push campaigns
                  </Text>
                </View>
                <Text style={styles.storeValue}>{scheduledPushCount}</Text>
                <Text style={styles.storeFootnote}>
                  scheduled · {pushInsights.length} sent recently
                </Text>
                <Text style={styles.storeCta}>Open campaigns →</Text>
              </TouchableOpacity>

              {/* Build / Publish */}
              <TouchableOpacity
                style={styles.storeCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('More', { screen: 'Publish' } as any)}>
                <View style={styles.storeRow}>
                  <View style={[styles.storeIcon, { backgroundColor: theme.colors.infoLight }]}>
                    <Text style={[styles.storeIconText, { color: theme.colors.info }]}>↑</Text>
                  </View>
                  <Text style={styles.storeLabel} numberOfLines={1}>
                    Latest build
                  </Text>
                </View>
                <Text style={styles.storeValue} numberOfLines={1}>
                  {latestBuild ? `v${latestBuild.version}` : 'No builds'}
                </Text>
                <View style={{ marginTop: 4 }}>
                  <StatusBadge label={latestBuild?.status ?? 'idle'} tone={buildStatusTone} dot />
                </View>
                <Text style={styles.storeCta}>Open Publish →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* RECENT ACTIVITY */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Analytics', { screen: 'AnalyticsDashboard' } as any)}>
                <Text style={styles.sectionLink}>See analytics →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timelineCard}>
              {recentActivity.length === 0 ? (
                <EmptyState
                  icon="◇"
                  title="No activity yet"
                  description="Once you publish themes, send push notifications, or create discounts, you'll see updates here."
                  compact
                />
              ) : (
                recentActivity.map((item, idx) => {
                  const accent = theme.colors[item.tone === 'neutral' ? 'textSecondary' : item.tone];
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.activityRow,
                        idx < recentActivity.length - 1 && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: theme.colors.divider,
                        },
                      ]}>
                      <View style={[styles.activityIcon, { backgroundColor: accent + '22' }]}>
                        <Text style={[styles.activityIconText, { color: accent }]}>{item.glyph}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.activitySubtitle} numberOfLines={1}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
