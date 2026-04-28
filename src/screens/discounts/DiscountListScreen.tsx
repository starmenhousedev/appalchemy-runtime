import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { discountsApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterChips } from '../../components/common/FilterChips';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { DISCOUNT_TYPES } from '../../utils/constants';
import type { Discount } from '../../types';
import type { DrawerParamList } from '../../navigation/types';

type Filter = 'all' | 'active' | 'inactive';

export function DiscountListScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const drawerNav = navigation.getParent() as DrawerNavigationProp<DrawerParamList> | undefined;

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await discountsApi.list(status as 'active' | 'inactive' | undefined);
      setDiscounts(Array.isArray(data) ? data : []);
    } catch {
      setDiscounts([]);
      showToast('error', 'Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return discounts;
    const q = search.toLowerCase();
    return discounts.filter(
      d =>
        (d.title ?? '').toLowerCase().includes(q) ||
        (d.coupon_code ?? '').toLowerCase().includes(q),
    );
  }, [discounts, search]);

  const counts = useMemo(
    () => ({
      all: discounts.length,
      active: discounts.filter(d => d.is_active).length,
      inactive: discounts.filter(d => !d.is_active).length,
    }),
    [discounts],
  );

  const handleToggle = async (id: number) => {
    try {
      const updated = await discountsApi.toggle(id);
      setDiscounts(prev => prev.map(d => (d.id === id && updated ? updated : d)));
    } catch {
      showToast('error', 'Failed to toggle discount');
    }
  };

  const handleClone = async (id: number) => {
    try {
      const cloned = await discountsApi.clone(id);
      if (cloned) setDiscounts(prev => [...prev, cloned]);
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        toolbar: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm, paddingBottom: theme.spacing.sm },
        list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.sm },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.shadows.sm,
        },
        cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
        title: { ...theme.typography.bodyMedium, color: theme.colors.text, flex: 1 },
        badges: { flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap', marginTop: theme.spacing.xs },
        couponRow: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm },
        couponLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
        couponCode: {
          ...theme.typography.captionMedium,
          color: theme.colors.primary,
          backgroundColor: theme.colors.primarySoft,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.sm,
          overflow: 'hidden',
          marginLeft: theme.spacing.xs,
        },
        valueText: {
          ...theme.typography.h4,
          color: theme.colors.success,
          marginTop: theme.spacing.sm,
        },
        actionsRow: {
          flexDirection: 'row',
          gap: theme.spacing.lg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
          paddingTop: theme.spacing.sm,
          marginTop: theme.spacing.sm,
        },
        actionLink: { ...theme.typography.captionMedium, color: theme.colors.primary, paddingVertical: 4 },
        dangerLink: { ...theme.typography.captionMedium, color: theme.colors.error, paddingVertical: 4 },
      }),
    [theme, insets.bottom],
  );

  const renderCard = ({ item }: { item: Discount }) => {
    const typeLabel = DISCOUNT_TYPES.find(t => t.value === item.type)?.label || item.type || '—';
    const isActive = !!item.is_active;
    const valueNumber = Number(item.discount_value) || 0;
    const valueLabel =
      item.discount_type === 'percentage' ? `${valueNumber}% off` : `$${valueNumber} off`;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title || 'Untitled discount'}
          </Text>
          <Switch
            value={isActive}
            onValueChange={() => handleToggle(item.id)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            thumbColor={isActive ? theme.colors.primary : theme.colors.textTertiary}
          />
        </View>
        <View style={styles.badges}>
          <StatusBadge label={typeLabel} tone="primary" />
          <StatusBadge label={isActive ? 'Active' : 'Inactive'} tone={isActive ? 'success' : 'neutral'} dot />
        </View>
        {item.coupon_code ? (
          <View style={styles.couponRow}>
            <Text style={styles.couponLabel}>Code</Text>
            <Text style={styles.couponCode}>{item.coupon_code}</Text>
          </View>
        ) : null}
        <Text style={styles.valueText}>{valueLabel}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => navigation.navigate('DiscountForm', { discountId: item.id })}>
            <Text style={styles.actionLink}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleClone(item.id)}>
            <Text style={styles.actionLink}>Clone</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.dangerLink}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Discounts"
        subtitle={`${counts.active} active · ${counts.all} total`}
        onMenu={() => drawerNav?.openDrawer()}
        right={
          <ActionButton
            label="+ New"
            onPress={() => navigation.navigate('DiscountForm')}
            size="sm"
          />
        }
      />

      <View style={styles.toolbar}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search discounts…" />
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { label: 'All', value: 'all', count: counts.all },
            { label: 'Active', value: 'active', count: counts.active },
            { label: 'Inactive', value: 'inactive', count: counts.inactive },
          ]}
        />
      </View>

      {loading && discounts.length === 0 ? (
        <LoadingState message="Loading discounts…" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={renderCard}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchDiscounts}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                icon="%"
                title="No discounts yet"
                description={search ? 'Try a different search term.' : 'Create your first discount to attract customers.'}
                actionLabel={search ? undefined : 'Create discount'}
                onAction={search ? undefined : () => navigation.navigate('DiscountForm')}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}
