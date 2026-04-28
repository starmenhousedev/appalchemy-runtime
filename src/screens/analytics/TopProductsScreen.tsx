import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyticsApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { DateRangeSelector, PRESET_RANGES } from '../../components/analytics';
import type { DateRange } from '../../components/analytics';
import type { TopProduct, AnalyticsQueryParams } from '../../types';

export function TopProductsScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [dateRange, setDateRange] = useState<DateRange>(PRESET_RANGES[1]);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<TopProduct[]>([]);

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
        const data = await analyticsApi.topProducts(buildParams());
        setProducts(data);
      } catch {
        showToast('error', 'Failed to load products');
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

  const totalRevenue = useMemo(
    () => products.reduce((sum, p) => sum + (p.revenue || 0), 0),
    [products],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        dateBar: { padding: theme.spacing.lg, paddingBottom: theme.spacing.sm },
        content: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.md },
        summaryRow: { flexDirection: 'row', gap: theme.spacing.sm },
        productCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          ...theme.shadows.sm,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        productHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md },
        rank: { ...theme.typography.h3, color: theme.colors.textTertiary, width: 36 },
        productImage: { width: 56, height: 56, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.surfaceSecondary },
        productTitle: { ...theme.typography.bodyMedium, color: theme.colors.text },
        productRevenue: { ...theme.typography.captionMedium, color: theme.colors.success, marginTop: 2 },
        metricsRow: { flexDirection: 'row', gap: theme.spacing.sm },
        pill: {
          flex: 1,
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceSecondary,
          borderRadius: theme.borderRadius.md,
          paddingVertical: theme.spacing.sm,
        },
        pillValue: { ...theme.typography.captionMedium, color: theme.colors.text },
        pillLabel: { ...theme.typography.small, color: theme.colors.textTertiary, marginTop: 1 },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Top Products" subtitle={dateRange.label} onBack={() => navigation.goBack()} />
      <View style={styles.dateBar}>
        <DateRangeSelector
          selectedRange={dateRange}
          onSelectRange={setDateRange}
          compareEnabled={compareEnabled}
          onToggleCompare={setCompareEnabled}
        />
      </View>
      {loading && products.length === 0 ? (
        <LoadingState message="Loading products…" />
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
          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <StatCard label="Products" value={products.length.toString()} icon="◇" accent="primary" />
            </View>
            <View style={{ flex: 1 }}>
              <StatCard
                label="Total Revenue"
                value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                icon="$"
                accent="success"
              />
            </View>
          </View>

          {products.length === 0 ? (
            <EmptyState
              icon="◇"
              title="No product data"
              description="Product analytics will appear once customers start interacting with your app."
            />
          ) : (
            products.map((product, index) => (
              <View key={product.product_id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                  ) : (
                    <View style={styles.productImage} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <Text style={styles.productRevenue}>
                      ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
                <View style={styles.metricsRow}>
                  {[
                    { label: 'Viewed', value: product.viewed },
                    { label: 'Cart', value: product.added_to_cart },
                    { label: 'Wishlist', value: product.wishlisted },
                    { label: 'Bought', value: product.purchased },
                  ].map(m => (
                    <View key={m.label} style={styles.pill}>
                      <Text style={styles.pillValue}>{m.value.toLocaleString()}</Text>
                      <Text style={styles.pillLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
