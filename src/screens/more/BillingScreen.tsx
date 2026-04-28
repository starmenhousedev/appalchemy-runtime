import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billingApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SectionCard } from '../../components/common/SectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Input } from '../../components/common/Input';
import type { Plan, BillingRecord } from '../../types';

export function BillingScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<BillingRecord | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const fetchData = useCallback(async () => {
    try {
      const [planData, plansData, invoiceData] = await Promise.all([
        billingApi.getCurrentPlan().catch(() => null),
        billingApi.listPlans().catch(() => []),
        billingApi.getInvoices().catch(() => []),
      ]);
      setCurrentPlan(planData ?? null);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      if (planData?.billing_cycle) setBillingCycle(planData.billing_cycle);
    } catch {
      showToast('error', 'Failed to load billing info');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openConfirmation = (url?: string | null) => {
    if (!url) return;
    Linking.openURL(url).catch(() => showToast('error', 'Failed to open Shopify confirmation'));
  };

  const handleSubscribe = (plan: Plan) => {
    const price = billingCycle === 'monthly' ? plan.monthly_price : plan.annual_price;
    const isUpgrade = !!currentPlan && currentPlan.status === 'active' && currentPlan.plan_id !== plan.id;
    Alert.alert(
      isUpgrade ? 'Switch plan' : 'Subscribe',
      `${isUpgrade ? 'Switch to' : 'Subscribe to'} ${plan.name} for $${price}/${billingCycle === 'monthly' ? 'mo' : 'yr'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isUpgrade ? 'Switch' : 'Subscribe',
          onPress: async () => {
            try {
              const result = isUpgrade
                ? await billingApi.upgrade(plan.id, billingCycle)
                : await billingApi.subscribe(plan.id, billingCycle);
              fetchData();
              if (result?.confirmation_url) {
                openConfirmation(result.confirmation_url);
                showToast('info', 'Approve the charge in Shopify, then return to confirm.');
              } else {
                showToast('success', isUpgrade ? `Switched to ${plan.name}` : `Subscribed to ${plan.name}`);
              }
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ||
                err?.message ||
                (isUpgrade ? 'Failed to switch plan' : 'Failed to subscribe');
              showToast('error', msg);
            }
          },
        },
      ],
    );
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [chargeId, setChargeId] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleConfirmCharge = async () => {
    const id = chargeId.trim();
    if (!id) {
      showToast('error', 'Charge ID is required');
      return;
    }
    setConfirming(true);
    try {
      const updated = await billingApi.confirmCharge(id);
      setCurrentPlan(updated ?? null);
      setChargeId('');
      setConfirmOpen(false);
      fetchData();
      showToast('success', 'Charge confirmed');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to confirm charge';
      showToast('error', msg);
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Plan', 'Are you sure you want to cancel your subscription?', [
      { text: 'Keep Plan', style: 'cancel' },
      {
        text: 'Cancel Plan',
        style: 'destructive',
        onPress: async () => {
          try {
            await billingApi.cancel();
            fetchData();
            showToast('success', 'Plan cancelled');
          } catch (err: any) {
            const msg =
              err?.response?.data?.message || err?.message || 'Failed to cancel plan';
            showToast('error', msg);
          }
        },
      },
    ]);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.md },
        currentPlan: {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          alignItems: 'center',
          ...theme.shadows.md,
        },
        currentPlanLabel: { ...theme.typography.captionMedium, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.5 },
        currentPlanName: { ...theme.typography.h2, color: '#fff', marginTop: theme.spacing.xs },
        currentPlanPrice: { ...theme.typography.body, color: 'rgba(255,255,255,0.9)', marginTop: theme.spacing.xs },
        cancelText: { ...theme.typography.captionMedium, color: 'rgba(255,255,255,0.8)', marginTop: theme.spacing.md, textDecorationLine: 'underline' },
        cycleToggle: {
          flexDirection: 'row',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          padding: 3,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        cycleBtn: { flex: 1, paddingVertical: theme.spacing.sm, borderRadius: theme.borderRadius.sm, alignItems: 'center' },
        cycleBtnActive: { backgroundColor: theme.colors.primary },
        cycleBtnText: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        cycleBtnTextActive: { color: '#fff' },
        planCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          ...theme.shadows.sm,
          borderWidth: 1.5,
          borderColor: theme.colors.borderLight,
        },
        planCardCurrent: { borderColor: theme.colors.primary },
        planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: theme.spacing.sm },
        planName: { ...theme.typography.h4, color: theme.colors.text },
        planPrice: { ...theme.typography.h3, color: theme.colors.text },
        planPeriod: { ...theme.typography.caption, color: theme.colors.textTertiary },
        featureText: { ...theme.typography.caption, color: theme.colors.textSecondary, lineHeight: 20 },
        invoiceRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.divider,
        },
        invoicePlan: { ...theme.typography.captionMedium, color: theme.colors.text },
        invoiceDate: { ...theme.typography.small, color: theme.colors.textTertiary },
        invoiceAmount: { ...theme.typography.bodyMedium, color: theme.colors.text },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Billing" onBack={() => navigation.goBack()} />
      {loading ? (
        <LoadingState message="Loading billing info…" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }>
          {currentPlan && (
            <View style={styles.currentPlan}>
              <Text style={styles.currentPlanLabel}>Current Plan</Text>
              <Text style={styles.currentPlanName}>{currentPlan.plan_name}</Text>
              <Text style={styles.currentPlanPrice}>
                ${currentPlan.price}/{currentPlan.billing_cycle === 'monthly' ? 'mo' : 'yr'}
              </Text>
              <View style={{ marginTop: theme.spacing.md }}>
                <StatusBadge
                  label={currentPlan.status}
                  tone={currentPlan.status === 'active' ? 'success' : 'error'}
                />
              </View>
              {currentPlan.status === 'active' ? (
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel plan</Text>
                </TouchableOpacity>
              ) : null}
              {currentPlan.status === 'pending' && currentPlan.shopify_charge_id ? (
                <TouchableOpacity onPress={() => {
                  setChargeId(currentPlan.shopify_charge_id || '');
                  setConfirmOpen(true);
                }}>
                  <Text style={styles.cancelText}>Confirm charge in Shopify</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          <ActionButton
            label="I have a charge ID to confirm"
            variant="ghost"
            size="sm"
            onPress={() => setConfirmOpen(true)}
          />

          <View style={styles.cycleToggle}>
            {(['monthly', 'annual'] as const).map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.cycleBtn, billingCycle === c && styles.cycleBtnActive]}
                onPress={() => setBillingCycle(c)}>
                <Text style={[styles.cycleBtnText, billingCycle === c && styles.cycleBtnTextActive]}>
                  {c === 'monthly' ? 'Monthly' : 'Annual · Save 20%'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <SectionCard title="Available plans" padded={false}>
            <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, gap: theme.spacing.sm }}>
              {plans.length === 0 ? (
                <EmptyState icon="$" title="No plans available" compact />
              ) : (
                plans.map(plan => {
                  const price = billingCycle === 'monthly' ? plan.monthly_price : plan.annual_price;
                  const isCurrent = currentPlan?.plan_id === plan.id && currentPlan?.status === 'active';
                  return (
                    <View key={plan.id} style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
                      <View style={styles.planHeader}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planPrice}>
                          ${price}
                          <Text style={styles.planPeriod}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</Text>
                        </Text>
                      </View>
                      <View style={{ gap: 4, marginBottom: theme.spacing.md }}>
                        {plan.features.map((f, i) => (
                          <Text key={i} style={styles.featureText}>
                            ✓ {f}
                          </Text>
                        ))}
                      </View>
                      {isCurrent ? (
                        <StatusBadge label="Current plan" tone="primary" dot />
                      ) : (
                        <ActionButton
                          label={currentPlan ? 'Switch plan' : 'Subscribe'}
                          onPress={() => handleSubscribe(plan)}
                          variant="primary"
                          size="md"
                          fullWidth
                        />
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </SectionCard>

          <Modal
            visible={confirmOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setConfirmOpen(false)}>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.overlay,
                justifyContent: 'center',
                padding: theme.spacing.lg,
              }}>
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                }}>
                <Text style={[theme.typography.h4, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
                  Confirm Shopify charge
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
                  After approving the charge in Shopify, paste the charge ID here to activate your plan.
                </Text>
                <Input
                  label="Charge ID"
                  value={chargeId}
                  onChangeText={setChargeId}
                  placeholder="gid://shopify/AppSubscription/..."
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                  <ActionButton label="Cancel" variant="ghost" onPress={() => setConfirmOpen(false)} />
                  <ActionButton label="Confirm" loading={confirming} onPress={handleConfirmCharge} />
                </View>
              </View>
            </View>
          </Modal>

          <SectionCard title="Billing history" padded={false}>
            <View style={{ paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md }}>
              {invoices.length === 0 ? (
                <EmptyState icon="◇" title="No invoices yet" compact />
              ) : (
                invoices.map(inv => (
                  <View key={inv.id} style={styles.invoiceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invoicePlan}>{inv.plan_name}</Text>
                      <Text style={styles.invoiceDate}>{new Date(inv.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.invoiceAmount}>${inv.price}</Text>
                    <StatusBadge label={inv.status} tone={inv.status === 'active' ? 'success' : 'neutral'} />
                  </View>
                ))
              )}
            </View>
          </SectionCard>
        </ScrollView>
      )}
    </View>
  );
}
