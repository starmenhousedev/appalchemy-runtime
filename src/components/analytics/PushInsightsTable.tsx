import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { PushInsight } from '../../types';

interface PushInsightsTableProps {
  title: string;
  data: PushInsight[];
}

export function PushInsightsTable({ title, data }: PushInsightsTableProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {data.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.campaignCol]}>Campaign</Text>
              <Text style={[styles.headerCell, styles.numCol]}>Sent</Text>
              <Text style={[styles.headerCell, styles.numCol]}>Clicked</Text>
              <Text style={[styles.headerCell, styles.numCol]}>Cart</Text>
              <Text style={[styles.headerCell, styles.numCol]}>Orders</Text>
              <Text style={[styles.headerCell, styles.revenueCol]}>Revenue</Text>
              <Text style={[styles.headerCell, styles.statusCol]}>Status</Text>
            </View>

            {/* Rows */}
            {data.map((insight, index) => (
              <View
                key={`${insight.campaign_name}-${index}`}
                style={[styles.dataRow, index % 2 === 0 && styles.dataRowAlt]}>
                <Text style={[styles.dataCell, styles.campaignCol]} numberOfLines={1}>
                  {insight.campaign_name}
                </Text>
                <Text style={[styles.dataCell, styles.numCol]}>
                  {insight.sent.toLocaleString()}
                </Text>
                <Text style={[styles.dataCell, styles.numCol]}>
                  {insight.clicked.toLocaleString()}
                </Text>
                <Text style={[styles.dataCell, styles.numCol]}>
                  {insight.add_to_cart.toLocaleString()}
                </Text>
                <Text style={[styles.dataCell, styles.numCol]}>
                  {insight.orders.toLocaleString()}
                </Text>
                <Text style={[styles.dataCell, styles.revenueCol, styles.revenueText]}>
                  ${insight.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
                <View style={[styles.statusCol, styles.statusContainer]}>
                  <View style={[
                    styles.statusBadge,
                    insight.status === 'active' ? styles.statusActive : styles.statusInactive,
                  ]}>
                    <Text style={[
                      styles.statusText,
                      insight.status === 'active' ? styles.statusTextActive : styles.statusTextInactive,
                    ]}>
                      {insight.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No push notification data</Text>
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
    paddingBottom: spacing.sm, alignItems: 'center',
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
  campaignCol: { width: 150 },
  numCol: { width: 60, textAlign: 'center' },
  revenueCol: { width: 85, textAlign: 'right' },
  statusCol: { width: 70 },
  dataCell: { ...typography.caption, color: colors.text },
  revenueText: { ...typography.captionMedium, color: colors.success },
  statusContainer: { alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusActive: { backgroundColor: colors.successLight },
  statusInactive: { backgroundColor: colors.surfaceSecondary },
  statusText: { ...typography.small, textTransform: 'capitalize' },
  statusTextActive: { color: colors.success },
  statusTextInactive: { color: colors.textTertiary },
  emptyState: {
    height: 80, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md,
  },
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
