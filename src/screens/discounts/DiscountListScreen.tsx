import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { discountsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { DISCOUNT_TYPES } from '../../utils/constants';
import type { Discount } from '../../types';

function DiscountCard({
  discount,
  onToggle,
  onEdit,
  onClone,
  onDelete,
}: {
  discount: Discount;
  onToggle: () => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}) {
  const typeLabel =
    DISCOUNT_TYPES.find(t => t.value === discount.type)?.label || discount.type;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>{discount.title}</Text>
          <Switch
            value={discount.is_active}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={discount.is_active ? colors.primary : colors.textTertiary}
          />
        </View>
        <View style={styles.badges}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: discount.is_active
                  ? colors.successLight
                  : colors.surfaceSecondary,
              },
            ]}>
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: discount.is_active ? colors.success : colors.textTertiary,
                },
              ]}>
              {discount.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      {discount.coupon_code && (
        <View style={styles.couponRow}>
          <Text style={styles.couponLabel}>Code: </Text>
          <Text style={styles.couponCode}>{discount.coupon_code}</Text>
        </View>
      )}

      <Text style={styles.discountValue}>
        {discount.discount_type === 'percentage'
          ? `${discount.discount_value}% off`
          : `$${discount.discount_value} off`}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onClone}>
          <Text style={styles.actionText}>Clone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Text style={[styles.actionText, { color: colors.error }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function DiscountListScreen({ navigation }: { navigation: any }) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await discountsApi.list(status as 'active' | 'inactive' | undefined);
      setDiscounts(data);
    } catch {
      showToast('error', 'Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleToggle = async (id: number) => {
    try {
      const updated = await discountsApi.toggle(id);
      setDiscounts(prev =>
        prev.map(d => (d.id === id ? updated : d)),
      );
    } catch {
      showToast('error', 'Failed to toggle discount');
    }
  };

  const handleClone = async (id: number) => {
    try {
      const cloned = await discountsApi.clone(id);
      setDiscounts(prev => [...prev, cloned]);
      showToast('success', 'Discount cloned');
    } catch {
      showToast('error', 'Failed to clone discount');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Discount', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await discountsApi.delete(id);
            setDiscounts(prev => prev.filter(d => d.id !== id));
            showToast('success', 'Discount deleted');
          } catch {
            showToast('error', 'Failed to delete discount');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>|||</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discounts</Text>
        <Button
          title="+ New"
          onPress={() => navigation.navigate('DiscountForm')}
          size="sm"
        />
      </View>

      <View style={styles.filterRow}>
        {(['all', 'active', 'inactive'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}>
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={discounts}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchDiscounts}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <DiscountCard
            discount={item}
            onToggle={() => handleToggle(item.id)}
            onEdit={() =>
              navigation.navigate('DiscountForm', { discountId: item.id })
            }
            onClone={() => handleClone(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No discounts yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first discount to attract customers
              </Text>
              <Button
                title="Create Discount"
                onPress={() => navigation.navigate('DiscountForm')}
                style={styles.emptyButton}
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  menuIcon: {
    fontSize: 16,
    color: colors.text,
    letterSpacing: -2,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textInverse,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight + '30',
  },
  typeBadgeText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  couponLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  couponCode: {
    ...typography.captionMedium,
    color: colors.primary,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  discountValue: {
    ...typography.bodyMedium,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  actionButton: {
    paddingVertical: spacing.xs,
  },
  actionText: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 160,
  },
});
