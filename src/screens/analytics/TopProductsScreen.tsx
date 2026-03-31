import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyticsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import {
  DateRangeSelector,
  PRESET_RANGES,
} from '../../components/analytics';
import { Button } from '../../components/common/Button';
import type { DateRange } from '../../components/analytics';
import type { TopProduct, AnalyticsQueryParams } from '../../types';

export function TopProductsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [dateRange, setDateRange] = useState<DateRange>(PRESET_RANGES[1]);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<TopProduct[]>([]);

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
      const data = await analyticsApi.topProducts(buildParams());
      setProducts(data);
    } catch {
      showToast('error', 'Failed to load products');
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

  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Top Products</Text>
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

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Products</Text>
            <Text style={styles.summaryValue}>{products.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Product List */}
        {products.map((product, index) => (
          <View key={product.product_id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.rank}>#{index + 1}</Text>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                <Text style={styles.productRevenue}>
                  ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
            <View style={styles.metricsRow}>
              <MetricPill label="Viewed" value={product.viewed} />
              <MetricPill label="Cart" value={product.added_to_cart} />
              <MetricPill label="Wishlist" value={product.wishlisted} />
              <MetricPill label="Bought" value={product.purchased} />
            </View>
          </View>
        ))}

        {!loading && products.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No product data</Text>
            <Text style={styles.emptySubtitle}>
              Product analytics will appear once customers start interacting with your app.
            </Text>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={pillStyles.container}>
      <Text style={pillStyles.value}>{value.toLocaleString()}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.xs,
  },
  value: { ...typography.captionMedium, color: colors.text },
  label: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
});

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
  summaryRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  summaryCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, alignItems: 'center', ...shadows.sm,
  },
  summaryLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  summaryValue: { ...typography.h2, color: colors.text },
  productCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  rank: { ...typography.h3, color: colors.textTertiary, width: 30 },
  productImage: {
    width: 56, height: 56, borderRadius: borderRadius.md, backgroundColor: colors.surfaceSecondary,
  },
  productImagePlaceholder: {
    width: 56, height: 56, borderRadius: borderRadius.md, backgroundColor: colors.surfaceSecondary,
  },
  productInfo: { flex: 1 },
  productTitle: { ...typography.bodyMedium, color: colors.text },
  productRevenue: { ...typography.captionMedium, color: colors.success, marginTop: 2 },
  metricsRow: { flexDirection: 'row', gap: spacing.sm },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
