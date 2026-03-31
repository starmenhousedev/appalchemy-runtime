import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themesApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { PRODUCT_SORTING_OPTIONS } from '../../utils/constants';
import type { CartGoal, ProductSortingConfig } from '../../types';

type SettingsTab = 'general' | 'labels' | 'sorting' | 'cart_goals';

export function ThemeSettingsScreen({
  route,
  navigation,
}: {
  route: { params: { themeId: number } };
  navigation: any;
}) {
  const { themeId } = route.params;
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SettingsTab>('sorting');
  const [sorting, setSorting] = useState<ProductSortingConfig | null>(null);
  const [cartGoals, setCartGoals] = useState<CartGoal[]>([]);

  // New cart goal form
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalMinQty, setGoalMinQty] = useState('');
  const [goalDiscountType, setGoalDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [goalDiscountValue, setGoalDiscountValue] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [sortData, goalsData] = await Promise.all([
        themesApi.getProductSorting(themeId).catch(() => null),
        themesApi.getCartGoals(themeId).catch(() => []),
      ]);
      if (sortData) setSorting(sortData);
      setCartGoals(goalsData);
    } catch {
      showToast('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSorting = async (defaultSort: string) => {
    try {
      const updated = await themesApi.updateProductSorting(themeId, {
        default_sort: defaultSort,
        options: sorting?.options || PRODUCT_SORTING_OPTIONS.map(o => o.value),
      });
      setSorting(updated);
      showToast('success', 'Sorting updated');
    } catch {
      showToast('error', 'Failed to update sorting');
    }
  };

  const handleAddGoal = async () => {
    if (!goalTitle.trim() || !goalMinQty || !goalDiscountValue) {
      showToast('error', 'All fields are required');
      return;
    }
    try {
      const goal = await themesApi.createCartGoal(themeId, {
        title: goalTitle.trim(),
        min_quantity: parseInt(goalMinQty, 10),
        discount_type: goalDiscountType,
        discount_value: parseFloat(goalDiscountValue),
        is_active: true,
        sort_order: cartGoals.length,
      });
      setCartGoals(prev => [...prev, goal]);
      setShowGoalForm(false);
      setGoalTitle('');
      setGoalMinQty('');
      setGoalDiscountValue('');
      showToast('success', 'Cart goal added');
    } catch {
      showToast('error', 'Failed to add cart goal');
    }
  };

  const handleDeleteGoal = (goalId: number) => {
    Alert.alert('Delete Cart Goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await themesApi.deleteCartGoal(themeId, goalId);
            setCartGoals(prev => prev.filter(g => g.id !== goalId));
            showToast('success', 'Goal deleted');
          } catch {
            showToast('error', 'Failed to delete goal');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingOverlay fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Theme Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.tabBar}>
        {([
          { key: 'sorting', label: 'Sorting' },
          { key: 'cart_goals', label: 'Cart Goals' },
          { key: 'labels', label: 'Labels' },
          { key: 'general', label: 'General' },
        ] as { key: SettingsTab; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'sorting' && (
          <View>
            <Text style={styles.sectionTitle}>Default Product Sorting</Text>
            <Text style={styles.sectionDesc}>
              Choose how products are sorted by default in your app
            </Text>
            {PRODUCT_SORTING_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sorting?.default_sort === option.value && styles.sortOptionActive,
                ]}
                onPress={() => handleUpdateSorting(option.value)}>
                <View style={[
                  styles.radio,
                  sorting?.default_sort === option.value && styles.radioActive,
                ]}>
                  {sorting?.default_sort === option.value && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.sortLabel,
                  sorting?.default_sort === option.value && styles.sortLabelActive,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tab === 'cart_goals' && (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Cart Goals</Text>
                <Text style={styles.sectionDesc}>Incentivize customers to buy more</Text>
              </View>
              <Button title="+ Add" onPress={() => setShowGoalForm(true)} size="sm" />
            </View>

            {cartGoals.map(goal => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalMeta}>
                    Buy {goal.min_quantity}+ → {goal.discount_type === 'percentage'
                      ? `${goal.discount_value}% off`
                      : `$${goal.discount_value} off`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)}>
                  <Text style={styles.deleteText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}

            {cartGoals.length === 0 && !showGoalForm && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No cart goals yet</Text>
              </View>
            )}

            {showGoalForm && (
              <View style={styles.goalForm}>
                <Input label="Goal Title" value={goalTitle} onChangeText={setGoalTitle} placeholder="e.g. Buy 2, Get 10% Off" />
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Input label="Min Quantity" value={goalMinQty} onChangeText={setGoalMinQty} keyboardType="numeric" placeholder="2" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Discount Value" value={goalDiscountValue} onChangeText={setGoalDiscountValue} keyboardType="numeric" placeholder="10" />
                  </View>
                </View>
                <View style={styles.row}>
                  {(['percentage', 'fixed'] as const).map(dt => (
                    <TouchableOpacity
                      key={dt}
                      style={[styles.dtBtn, goalDiscountType === dt && styles.dtBtnActive]}
                      onPress={() => setGoalDiscountType(dt)}>
                      <Text style={[styles.dtBtnText, goalDiscountType === dt && styles.dtBtnTextActive]}>
                        {dt === 'percentage' ? '% Off' : '$ Off'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.formActions}>
                  <Button title="Cancel" onPress={() => setShowGoalForm(false)} variant="ghost" />
                  <Button title="Add Goal" onPress={handleAddGoal} />
                </View>
              </View>
            )}
          </View>
        )}

        {tab === 'labels' && (
          <View>
            <Text style={styles.sectionTitle}>Product Labels</Text>
            <Text style={styles.sectionDesc}>
              Add labels like "Best Seller" or "New" to highlight products
            </Text>
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>Label editor coming soon</Text>
              <Text style={styles.comingSoonSub}>
                Configure product labels via the JSON settings
              </Text>
            </View>
          </View>
        )}

        {tab === 'general' && (
          <View>
            <Text style={styles.sectionTitle}>General Settings</Text>
            <Text style={styles.sectionDesc}>
              Configure general theme properties
            </Text>
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>General settings editor coming soon</Text>
              <Text style={styles.comingSoonSub}>
                Configure via Theme Code editor
              </Text>
              <Button
                title="Edit Theme Code"
                onPress={() => navigation.navigate('ThemeCode', { themeId })}
                variant="outline"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  headerTitle: { ...typography.h4, color: colors.text },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { ...typography.captionMedium, color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  sectionTitle: { ...typography.h4, color: colors.text },
  sectionDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.lg },
  // Sorting
  sortOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight,
  },
  sortOptionActive: {},
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  sortLabel: { ...typography.body, color: colors.text },
  sortLabelActive: { ...typography.bodyMedium, color: colors.primary },
  // Cart goals
  goalCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
  },
  goalInfo: { flex: 1 },
  goalTitle: { ...typography.bodyMedium, color: colors.text },
  goalMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  deleteText: { ...typography.bodyMedium, color: colors.error, padding: spacing.sm },
  goalForm: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginTop: spacing.md, ...shadows.sm,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  dtBtn: {
    flex: 1, paddingVertical: spacing.sm, alignItems: 'center',
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  dtBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  dtBtnText: { ...typography.captionMedium, color: colors.textSecondary },
  dtBtnTextActive: { color: colors.primary },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  // Empty / coming soon
  emptyState: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary },
  comingSoon: {
    padding: spacing.xxl, alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.lg,
  },
  comingSoonText: { ...typography.bodyMedium, color: colors.textSecondary },
  comingSoonSub: { ...typography.caption, color: colors.textTertiary, marginTop: 4 },
});
