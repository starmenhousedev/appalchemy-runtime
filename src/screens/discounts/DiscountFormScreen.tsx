import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { discountsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { DISCOUNT_TYPES } from '../../utils/constants';
import type { DiscountType, Discount } from '../../types';

export function DiscountFormScreen({
  route,
  navigation,
}: {
  route: { params?: { discountId?: number } };
  navigation: any;
}) {
  const discountId = route.params?.discountId;
  const isEditing = !!discountId;
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<DiscountType>('amount_off_products');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [showOnProduct, setShowOnProduct] = useState(false);
  const [termsConditions, setTermsConditions] = useState('');

  useEffect(() => {
    if (discountId) {
      loadDiscount();
    }
  }, [discountId]);

  const loadDiscount = async () => {
    try {
      const data = await discountsApi.get(discountId!);
      setType(data.type);
      setTitle(data.title);
      setDescription(data.description);
      setCouponCode(data.coupon_code || '');
      setDiscountValue(data.discount_value.toString());
      setDiscountType(data.discount_type);
      setShowOnProduct(data.show_on_product_page);
      setTermsConditions(data.terms_conditions || '');
    } catch {
      showToast('error', 'Failed to load discount');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('error', 'Title is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type,
        title: title.trim(),
        description: description.trim(),
        coupon_code: type === 'coupon_code' ? couponCode.trim() : null,
        discount_value: parseFloat(discountValue) || 0,
        discount_type: discountType,
        show_on_product_page: showOnProduct,
        terms_conditions: termsConditions.trim() || null,
        product_selection: 'all' as const,
        product_tags: [],
        product_skus: [],
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_purchase_amount: null,
        buy_quantity: null,
        get_quantity: null,
        gift_product_id: null,
        bundle_products: [],
      };

      if (isEditing) {
        await discountsApi.update(discountId!, payload);
        showToast('success', 'Discount updated');
      } else {
        await discountsApi.create(payload);
        showToast('success', 'Discount created');
      }
      navigation.goBack();
    } catch {
      showToast('error', `Failed to ${isEditing ? 'update' : 'create'} discount`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingOverlay fullScreen />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Discount' : 'New Discount'}
        </Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {!isEditing && (
          <View style={styles.typeSelector}>
            <Text style={styles.sectionTitle}>Discount Type</Text>
            <View style={styles.typeGrid}>
              {DISCOUNT_TYPES.map(dt => (
                <TouchableOpacity
                  key={dt.value}
                  style={[
                    styles.typeCard,
                    type === dt.value && styles.typeCardActive,
                  ]}
                  onPress={() => setType(dt.value as DiscountType)}>
                  <Text
                    style={[
                      styles.typeCardText,
                      type === dt.value && styles.typeCardTextActive,
                    ]}>
                    {dt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Summer Sale 10% Off" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Discount description" multiline numberOfLines={3} />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input label="Discount Value" value={discountValue} onChangeText={setDiscountValue} keyboardType="numeric" placeholder="10" />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>TYPE</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, discountType === 'percentage' && styles.toggleActive]}
                onPress={() => setDiscountType('percentage')}>
                <Text style={[styles.toggleText, discountType === 'percentage' && styles.toggleTextActive]}>%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, discountType === 'fixed' && styles.toggleActive]}
                onPress={() => setDiscountType('fixed')}>
                <Text style={[styles.toggleText, discountType === 'fixed' && styles.toggleTextActive]}>$</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {type === 'coupon_code' && (
          <>
            <Input label="Coupon Code" value={couponCode} onChangeText={setCouponCode} placeholder="SUMMER10" autoCapitalize="characters" />
            <Input label="Terms & Conditions" value={termsConditions} onChangeText={setTermsConditions} placeholder="Terms and conditions" multiline numberOfLines={3} />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Show code on product page</Text>
              <Switch
                value={showOnProduct}
                onValueChange={setShowOnProduct}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={showOnProduct ? colors.primary : colors.textTertiary}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: { ...typography.h4, color: colors.text },
  form: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionTitle: { ...typography.captionMedium, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  typeSelector: { marginBottom: spacing.lg },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  typeCardText: { ...typography.captionMedium, color: colors.textSecondary },
  typeCardTextActive: { color: colors.primary },
  row: { flexDirection: 'row', gap: spacing.md },
  halfInput: { flex: 1 },
  inputLabel: { ...typography.captionMedium, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  toggleText: { ...typography.bodyMedium, color: colors.textSecondary },
  toggleTextActive: { color: colors.primary },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  switchLabel: { ...typography.body, color: colors.text },
});
