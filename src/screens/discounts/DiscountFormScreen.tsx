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
import type { DiscountType, ProductSelection } from '../../types';

const PRODUCT_SELECTION_OPTIONS: { value: ProductSelection; label: string }[] = [
  { value: 'all', label: 'All products' },
  { value: 'with_tags', label: 'With tags' },
  { value: 'except_tags', label: 'Except tags' },
  { value: 'selected_skus', label: 'Selected SKUs' },
];

function csvToArray(s: string): string[] {
  return s
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

function arrayToCsv(a: unknown): string {
  return Array.isArray(a) ? a.filter(v => typeof v === 'string').join(', ') : '';
}

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

  // Common fields
  const [type, setType] = useState<DiscountType>('amount_off_products');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  // Coupon-specific
  const [couponCode, setCouponCode] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [showOnProduct, setShowOnProduct] = useState(false);

  // Product targeting
  const [productSelection, setProductSelection] = useState<ProductSelection>('all');
  const [productTagsCsv, setProductTagsCsv] = useState('');
  const [productSkusCsv, setProductSkusCsv] = useState('');

  // Per-type extras
  const [minPurchase, setMinPurchase] = useState('');
  const [buyQty, setBuyQty] = useState('');
  const [getQty, setGetQty] = useState('');
  const [giftProductId, setGiftProductId] = useState('');
  const [bundleProductsCsv, setBundleProductsCsv] = useState('');

  useEffect(() => {
    if (discountId) {
      loadDiscount();
    }
  }, [discountId]);

  const loadDiscount = async () => {
    try {
      const data = await discountsApi.get(discountId!);
      if (!data) throw new Error('No data');
      setType(data.type);
      setTitle(data.title ?? '');
      setDescription(data.description ?? '');
      setCouponCode(data.coupon_code ?? '');
      setDiscountValue(
        data.discount_value !== null && data.discount_value !== undefined
          ? String(data.discount_value)
          : '',
      );
      setDiscountType(data.discount_type ?? 'percentage');
      setShowOnProduct(!!data.show_on_product_page);
      setTermsConditions(data.terms_conditions ?? '');
      setProductSelection(data.product_selection ?? 'all');
      setProductTagsCsv(arrayToCsv(data.product_tags));
      setProductSkusCsv(arrayToCsv(data.product_skus));
      setMinPurchase(
        data.min_purchase_amount !== null && data.min_purchase_amount !== undefined
          ? String(data.min_purchase_amount)
          : '',
      );
      setBuyQty(data.buy_quantity != null ? String(data.buy_quantity) : '');
      setGetQty(data.get_quantity != null ? String(data.get_quantity) : '');
      setGiftProductId(data.gift_product_id ?? '');
      setBundleProductsCsv(arrayToCsv(data.bundle_products));
    } catch {
      showToast('error', 'Failed to load discount');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Title is required';
    if (type === 'coupon_code' && !couponCode.trim()) return 'Coupon code is required';
    if (type === 'buy_x_get_y') {
      if (!buyQty || parseInt(buyQty, 10) <= 0) return 'Buy quantity must be > 0';
      if (!getQty || parseInt(getQty, 10) <= 0) return 'Get quantity must be > 0';
    }
    if (type === 'free_gift' && !giftProductId.trim()) return 'Gift product ID is required';
    if (type === 'bundle' && !bundleProductsCsv.trim()) return 'At least one bundle product ID required';
    if (type === 'amount_off_orders') {
      if (!minPurchase || parseFloat(minPurchase) < 0) return 'Minimum purchase amount is required';
    }
    if ((productSelection === 'with_tags' || productSelection === 'except_tags') && !productTagsCsv.trim()) {
      return 'Tag list is required for the chosen product targeting';
    }
    if (productSelection === 'selected_skus' && !productSkusCsv.trim()) {
      return 'SKU list is required for the chosen product targeting';
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      showToast('error', err);
      return;
    }

    setSaving(true);
    try {
      const numValue = parseFloat(discountValue);
      const payload = {
        type,
        title: title.trim(),
        description: description.trim(),
        coupon_code: type === 'coupon_code' ? couponCode.trim() : null,
        discount_value: Number.isFinite(numValue) ? numValue : 0,
        discount_type: discountType,
        show_on_product_page: type === 'coupon_code' ? showOnProduct : false,
        terms_conditions:
          type === 'coupon_code' ? termsConditions.trim() || null : null,
        product_selection: productSelection,
        product_tags:
          productSelection === 'with_tags' || productSelection === 'except_tags'
            ? csvToArray(productTagsCsv)
            : [],
        product_skus:
          productSelection === 'selected_skus' ? csvToArray(productSkusCsv) : [],
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_purchase_amount:
          type === 'amount_off_orders' && minPurchase
            ? parseFloat(minPurchase)
            : null,
        buy_quantity: type === 'buy_x_get_y' ? parseInt(buyQty, 10) : null,
        get_quantity: type === 'buy_x_get_y' ? parseInt(getQty, 10) : null,
        gift_product_id: type === 'free_gift' ? giftProductId.trim() : null,
        bundle_products: type === 'bundle' ? csvToArray(bundleProductsCsv) : [],
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

  const showProductTargeting =
    type === 'amount_off_products' ||
    type === 'coupon_code' ||
    type === 'free_gift' ||
    type === 'bundle';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Discount' : 'New Discount'}
        </Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {!isEditing && (
          <View style={styles.typeSelector}>
            <Text style={styles.sectionTitle}>Discount Type</Text>
            <View style={styles.typeGrid}>
              {DISCOUNT_TYPES.map(dt => (
                <TouchableOpacity
                  key={dt.value}
                  style={[styles.typeCard, type === dt.value && styles.typeCardActive]}
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
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Discount description"
          multiline
          numberOfLines={3}
        />

        {(type === 'amount_off_products' ||
          type === 'amount_off_orders' ||
          type === 'coupon_code') && (
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Discount Value"
                value={discountValue}
                onChangeText={setDiscountValue}
                keyboardType="numeric"
                placeholder="10"
              />
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
        )}

        {type === 'amount_off_orders' && (
          <Input
            label="Minimum order amount ($)"
            value={minPurchase}
            onChangeText={setMinPurchase}
            keyboardType="numeric"
            placeholder="50"
          />
        )}

        {type === 'buy_x_get_y' && (
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Buy Quantity (X)"
                value={buyQty}
                onChangeText={setBuyQty}
                keyboardType="numeric"
                placeholder="2"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Get Quantity (Y)"
                value={getQty}
                onChangeText={setGetQty}
                keyboardType="numeric"
                placeholder="1"
              />
            </View>
          </View>
        )}

        {type === 'free_gift' && (
          <Input
            label="Gift Product ID (Shopify)"
            value={giftProductId}
            onChangeText={setGiftProductId}
            placeholder="gid://shopify/Product/12345 or numeric id"
            autoCapitalize="none"
          />
        )}

        {type === 'bundle' && (
          <Input
            label="Bundle Product IDs (comma separated)"
            value={bundleProductsCsv}
            onChangeText={setBundleProductsCsv}
            placeholder="12345, 67890, 11223"
            autoCapitalize="none"
            multiline
            numberOfLines={2}
          />
        )}

        {type === 'coupon_code' && (
          <>
            <Input
              label="Coupon Code"
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="SUMMER10"
              autoCapitalize="characters"
            />
            <Input
              label="Terms & Conditions"
              value={termsConditions}
              onChangeText={setTermsConditions}
              placeholder="Terms and conditions"
              multiline
              numberOfLines={3}
            />
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

        {showProductTargeting && (
          <View style={styles.targetingCard}>
            <Text style={styles.sectionTitle}>Apply to</Text>
            <View style={styles.targetingGrid}>
              {PRODUCT_SELECTION_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.typeCard,
                    productSelection === opt.value && styles.typeCardActive,
                  ]}
                  onPress={() => setProductSelection(opt.value)}>
                  <Text
                    style={[
                      styles.typeCardText,
                      productSelection === opt.value && styles.typeCardTextActive,
                    ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(productSelection === 'with_tags' || productSelection === 'except_tags') && (
              <Input
                label="Tags (comma separated)"
                value={productTagsCsv}
                onChangeText={setProductTagsCsv}
                placeholder="sale, summer, new-arrival"
                autoCapitalize="none"
              />
            )}
            {productSelection === 'selected_skus' && (
              <Input
                label="SKUs (comma separated)"
                value={productSkusCsv}
                onChangeText={setProductSkusCsv}
                placeholder="SKU-001, SKU-002, SKU-003"
                autoCapitalize="characters"
                multiline
                numberOfLines={2}
              />
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
  sectionTitle: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
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
  inputLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
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
  targetingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  targetingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
});
