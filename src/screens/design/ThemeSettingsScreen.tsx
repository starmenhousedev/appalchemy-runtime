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
import type { CartGoal, ProductSortingConfig, ProductLabel, ThemeSettings } from '../../types';

const LABEL_PRESET_COLORS = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#111827',
];

function makeLabelId() {
  return `label_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

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
  const [labels, setLabels] = useState<ProductLabel[]>([]);
  const [labelsSaving, setLabelsSaving] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_PRESET_COLORS[0]);

  // New cart goal form
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalMinQty, setGoalMinQty] = useState('');
  const [goalDiscountType, setGoalDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [goalDiscountValue, setGoalDiscountValue] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [goalSaving, setGoalSaving] = useState(false);

  // General settings JSON editor
  const [settingsJson, setSettingsJson] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [sortData, goalsData, labelData] = await Promise.all([
        themesApi.getProductSorting(themeId).catch(() => null),
        themesApi.getCartGoals(themeId).catch(() => []),
        themesApi.getProductLabels(themeId).catch(() => []),
      ]);
      if (sortData) setSorting(sortData);
      setCartGoals(Array.isArray(goalsData) ? goalsData : []);
      setLabels(Array.isArray(labelData) ? labelData : []);
    } catch {
      showToast('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = async () => {
    const text = newLabelText.trim();
    if (!text) {
      showToast('error', 'Label text is required');
      return;
    }
    const next: ProductLabel[] = [
      ...labels,
      { id: makeLabelId(), label: text, color: newLabelColor, condition: {} },
    ];
    setLabelsSaving(true);
    try {
      const saved = await themesApi.updateProductLabels(themeId, next);
      setLabels(Array.isArray(saved) ? saved : next);
      setNewLabelText('');
      showToast('success', 'Label added');
    } catch {
      showToast('error', 'Failed to add label');
    } finally {
      setLabelsSaving(false);
    }
  };

  const handleRemoveLabel = async (id: string) => {
    const next = labels.filter(l => l.id !== id);
    setLabelsSaving(true);
    try {
      const saved = await themesApi.updateProductLabels(themeId, next);
      setLabels(Array.isArray(saved) ? saved : next);
      showToast('success', 'Label removed');
    } catch {
      showToast('error', 'Failed to remove label');
    } finally {
      setLabelsSaving(false);
    }
  };

  const handleUpdateSorting = async (order: string) => {
    try {
      const updated = await themesApi.updateProductSorting(themeId, { order });
      setSorting(updated);
      showToast('success', 'Sorting updated');
    } catch {
      showToast('error', 'Failed to update sorting');
    }
  };

  const resetGoalForm = () => {
    setEditingGoalId(null);
    setShowGoalForm(false);
    setGoalTitle('');
    setGoalMinQty('');
    setGoalDiscountValue('');
    setGoalDiscountType('percentage');
  };

  const beginEditGoal = (goal: CartGoal) => {
    setEditingGoalId(goal.id);
    setShowGoalForm(true);
    setGoalTitle(goal.title);
    setGoalMinQty(String(goal.min_quantity));
    setGoalDiscountType(goal.discount_type);
    setGoalDiscountValue(String(goal.discount_value));
  };

  const handleSaveGoal = async () => {
    if (!goalTitle.trim() || !goalMinQty || !goalDiscountValue) {
      showToast('error', 'All fields are required');
      return;
    }
    setGoalSaving(true);
    try {
      const payload = {
        title: goalTitle.trim(),
        min_quantity: parseInt(goalMinQty, 10),
        discount_type: goalDiscountType,
        discount_value: parseFloat(goalDiscountValue),
      };
      if (editingGoalId !== null) {
        const updated = await themesApi.updateCartGoal(themeId, editingGoalId, payload);
        setCartGoals(prev => prev.map(g => (g.id === editingGoalId ? updated : g)));
        showToast('success', 'Cart goal updated');
      } else {
        const goal = await themesApi.createCartGoal(themeId, {
          ...payload,
          is_active: true,
          sort_order: cartGoals.length,
        });
        setCartGoals(prev => [...prev, goal]);
        showToast('success', 'Cart goal added');
      }
      resetGoalForm();
    } catch {
      showToast('error', `Failed to ${editingGoalId !== null ? 'update' : 'add'} cart goal`);
    } finally {
      setGoalSaving(false);
    }
  };

  const loadGeneralSettings = async () => {
    if (settingsLoaded) return;
    setSettingsLoading(true);
    try {
      const data = await themesApi.getSettings(themeId);
      setSettingsJson(JSON.stringify(data ?? {}, null, 2));
      setSettingsLoaded(true);
    } catch {
      showToast('error', 'Failed to load theme settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    let parsed: Partial<ThemeSettings>;
    try {
      parsed = JSON.parse(settingsJson || '{}');
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Settings must be a JSON object');
      }
    } catch (err: any) {
      showToast('error', err?.message ?? 'Invalid JSON');
      return;
    }
    setSettingsSaving(true);
    try {
      const updated = await themesApi.updateSettings(themeId, parsed);
      setSettingsJson(JSON.stringify(updated ?? {}, null, 2));
      showToast('success', 'Theme settings saved');
    } catch {
      showToast('error', 'Failed to save theme settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    if (tab === 'general') loadGeneralSettings();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

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
                  sorting?.order === option.value && styles.sortOptionActive,
                ]}
                onPress={() => handleUpdateSorting(option.value)}>
                <View style={[
                  styles.radio,
                  sorting?.order === option.value && styles.radioActive,
                ]}>
                  {sorting?.order === option.value && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.sortLabel,
                  sorting?.order === option.value && styles.sortLabelActive,
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
                <TouchableOpacity onPress={() => beginEditGoal(goal)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
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
                  <Button title="Cancel" onPress={resetGoalForm} variant="ghost" />
                  <Button
                    title={editingGoalId !== null ? 'Save changes' : 'Add Goal'}
                    onPress={handleSaveGoal}
                    loading={goalSaving}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {tab === 'labels' && (
          <View>
            <Text style={styles.sectionTitle}>Product Labels</Text>
            <Text style={styles.sectionDesc}>
              Add labels like "Best Seller" or "New" to highlight products.
            </Text>

            <Input
              label="Label text"
              value={newLabelText}
              onChangeText={setNewLabelText}
              placeholder="e.g. Best Seller"
              autoCapitalize="words"
            />
            <Text style={styles.labelColorHeading}>Color</Text>
            <View style={styles.labelColorRow}>
              {LABEL_PRESET_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNewLabelColor(c)}
                  style={[
                    styles.labelSwatch,
                    { backgroundColor: c },
                    newLabelColor === c && styles.labelSwatchActive,
                  ]}
                />
              ))}
            </View>
            <Button
              title="Add label"
              onPress={handleAddLabel}
              loading={labelsSaving}
              style={{ marginTop: spacing.md }}
            />

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
              Existing labels
            </Text>
            {labels.length === 0 ? (
              <View style={styles.comingSoon}>
                <Text style={styles.comingSoonText}>No labels yet</Text>
                <Text style={styles.comingSoonSub}>
                  Add a label above to highlight products in your storefront.
                </Text>
              </View>
            ) : (
              <View>
                {labels.map(l => (
                  <View key={l.id} style={styles.labelRow}>
                    <View style={[styles.labelChip, { backgroundColor: l.color }]}>
                      <Text style={styles.labelChipText} numberOfLines={1}>
                        {l.label}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveLabel(l.id)}>
                      <Text style={styles.labelRemove}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {tab === 'general' && (
          <View>
            <Text style={styles.sectionTitle}>General Settings</Text>
            <Text style={styles.sectionDesc}>
              Edit the raw theme settings document. Changes apply on save.
            </Text>
            {settingsLoading && !settingsLoaded ? (
              <View style={styles.comingSoon}>
                <Text style={styles.comingSoonText}>Loading settings…</Text>
              </View>
            ) : (
              <>
                <Input
                  label="Settings (JSON)"
                  value={settingsJson}
                  onChangeText={setSettingsJson}
                  multiline
                  numberOfLines={12}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder='{ "primary_color": "#000" }'
                />
                <View style={styles.formActions}>
                  <Button
                    title="Reload"
                    variant="ghost"
                    onPress={() => {
                      setSettingsLoaded(false);
                      loadGeneralSettings();
                    }}
                  />
                  <Button title="Save" loading={settingsSaving} onPress={handleSaveGeneralSettings} />
                </View>
                <Button
                  title="Edit Theme Code"
                  onPress={() => navigation.navigate('ThemeCode', { themeId })}
                  variant="outline"
                  style={{ marginTop: spacing.md }}
                />
              </>
            )}
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
  editText: { ...typography.captionMedium, color: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
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
  labelColorHeading: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.sm, marginBottom: spacing.xs,
  },
  labelColorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  labelSwatch: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: 'transparent',
  },
  labelSwatchActive: { borderColor: colors.text },
  labelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  labelChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm, maxWidth: '70%',
  },
  labelChipText: { ...typography.captionMedium, color: '#fff' },
  labelRemove: { ...typography.captionMedium, color: colors.error },
});
