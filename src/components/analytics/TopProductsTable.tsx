import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { TopProduct } from '../../types';

interface TopProductsTableProps {
  data: TopProduct[];
}

export function TopProductsTable({ data }: TopProductsTableProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Products</Text>

      {data.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.productCol]}>Product</Text>
              <Text style={[styles.headerCell, styles.metricCol]}>Viewed</Text>
              <Text style={[styles.headerCell, styles.metricCol]}>Cart</Text>
              <Text style={[styles.headerCell, styles.metricCol]}>Wish</Text>
              <Text style={[styles.headerCell, styles.metricCol]}>Bought</Text>
              <Text style={[styles.headerCell, styles.revenueCol]}>Revenue</Text>
            </View>

            {/* Rows */}
            {data.map((product, index) => (
              <View
                key={product.product_id}
                style={[styles.dataRow, index % 2 === 0 && styles.dataRowAlt]}>
                <View style={[styles.productCell, styles.productCol]}>
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                  ) : (
                    <View style={styles.productImagePlaceholder} />
                  )}
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                </View>
                <Text style={[styles.dataCell, styles.metricCol]}>
                  {product.viewed.toLocaleString()}
                </Text>
                <Text style={[styles.dataCell, styles.metricCol]}>
                  {product.added_to_cart.toLocaleString()}
                </Text>
                <Text style={[styles.dataCell, styles.metricCol]}>
                  {product.wishlisted.toLocaleString()}
                </Text>
                <Text style={[styles.dataCell, styles.metricCol]}>
                  {product.purchased.toLocaleString()}
                </Text>
                <Text style={[styles.dataCell, styles.revenueCol, styles.revenueText]}>
                  ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No product data</Text>
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
  title: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.md },
  headerRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  headerCell: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.3,
  },
  dataRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight,
  },
  dataRowAlt: { backgroundColor: colors.surfaceSecondary + '50' },
  productCol: { width: 180 },
  metricCol: { width: 65, textAlign: 'center' },
  revenueCol: { width: 90, textAlign: 'right' },
  productCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  productImage: { width: 36, height: 36, borderRadius: borderRadius.sm, backgroundColor: colors.surfaceSecondary },
  productImagePlaceholder: {
    width: 36, height: 36, borderRadius: borderRadius.sm, backgroundColor: colors.surfaceSecondary,
  },
  productTitle: { ...typography.caption, color: colors.text, flex: 1 },
  dataCell: { ...typography.caption, color: colors.text },
  revenueText: { ...typography.captionMedium, color: colors.success },
  emptyState: {
    height: 80, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
