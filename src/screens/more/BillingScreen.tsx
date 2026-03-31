import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { billingApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import type { Plan, BillingRecord } from '../../types';

export function BillingScreen({ navigation }: { navigation: any }) {
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
        billingApi.listPlans(),
        billingApi.getInvoices().catch(() => []),
      ]);
      setCurrentPlan(planData);
      setPlans(plansData);
      setInvoices(invoiceData);
      if (planData?.billing_cycle) setBillingCycle(planData.billing_cycle);
    } catch {
      showToast('error', 'Failed to load billing info');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscribe = (plan: Plan) => {
    const price = billingCycle === 'monthly' ? plan.monthly_price : plan.annual_price;
    Alert.alert(
      'Subscribe',
      `Subscribe to ${plan.name} for $${price}/${billingCycle === 'monthly' ? 'mo' : 'yr'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              await billingApi.subscribe(plan.id, billingCycle);
              fetchData();
              showToast('success', `Subscribed to ${plan.name}`);
            } catch {
              showToast('error', 'Failed to subscribe');
            }
          },
        },
      ],
    );
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
          } catch {
            showToast('error', 'Failed to cancel plan');
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
        <Text style={styles.headerTitle}>Billing</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[colors.primary]} />}>

        {/* Current Plan */}
        {currentPlan && (
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanLabel}>Current Plan</Text>
            <Text style={styles.currentPlanName}>{currentPlan.plan_name}</Text>
            <Text style={styles.currentPlanPrice}>
              ${currentPlan.price}/{currentPlan.billing_cycle === 'monthly' ? 'mo' : 'yr'}
            </Text>
            <View style={[styles.statusBadge, {
              backgroundColor: currentPlan.status === 'active' ? colors.successLight : colors.error + '15',
            }]}>
              <Text style={[styles.statusText, {
                color: currentPlan.status === 'active' ? colors.success : colors.error,
              }]}>
                {currentPlan.status}
              </Text>
            </View>
            {currentPlan.status === 'active' && (
              <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Billing Cycle Toggle */}
        <View style={styles.cycleToggle}>
          {(['monthly', 'annual'] as const).map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.cycleBtn, billingCycle === c && styles.cycleBtnActive]}
              onPress={() => setBillingCycle(c)}>
              <Text style={[styles.cycleBtnText, billingCycle === c && styles.cycleBtnTextActive]}>
                {c === 'monthly' ? 'Monthly' : 'Annual (Save 20%)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plans */}
        <Text style={styles.sectionTitle}>AVAILABLE PLANS</Text>
        {plans.map(plan => {
          const price = billingCycle === 'monthly' ? plan.monthly_price : plan.annual_price;
          const isCurrent = currentPlan?.plan_id === plan.id && currentPlan?.status === 'active';

          return (
            <View key={plan.id} style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>
                  ${price}<Text style={styles.planPeriod}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</Text>
                </Text>
              </View>
              <View style={styles.featureList}>
                {plan.features.map((f, i) => (
                  <Text key={i} style={styles.featureText}>  {f}</Text>
                ))}
              </View>
              {!isCurrent && (
                <Button
                  title={currentPlan ? 'Switch Plan' : 'Subscribe'}
                  onPress={() => handleSubscribe(plan)}
                  variant={isCurrent ? 'secondary' : 'primary'}
                  size="sm"
                  style={styles.planBtn}
                />
              )}
              {isCurrent && (
                <Text style={styles.currentLabel}>Current Plan</Text>
              )}
            </View>
          );
        })}

        {/* Invoices */}
        {invoices.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>BILLING HISTORY</Text>
            {invoices.map(inv => (
              <View key={inv.id} style={styles.invoiceRow}>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.invoicePlan}>{inv.plan_name}</Text>
                  <Text style={styles.invoiceDate}>
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.invoiceAmount}>${inv.price}</Text>
                <View style={[styles.invoiceStatus, {
                  backgroundColor: inv.status === 'active' ? colors.successLight : colors.surfaceSecondary,
                }]}>
                  <Text style={[styles.invoiceStatusText, {
                    color: inv.status === 'active' ? colors.success : colors.textTertiary,
                  }]}>
                    {inv.status}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  currentPlanCard: {
    backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
  },
  currentPlanLabel: { ...typography.captionMedium, color: 'rgba(255,255,255,0.7)' },
  currentPlanName: { ...typography.h2, color: '#fff', marginTop: spacing.xs },
  currentPlanPrice: { ...typography.body, color: 'rgba(255,255,255,0.9)', marginTop: spacing.xs },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: borderRadius.sm, marginTop: spacing.md },
  statusText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize' },
  cancelBtn: { marginTop: spacing.md },
  cancelBtnText: { ...typography.captionMedium, color: 'rgba(255,255,255,0.7)' },
  cycleToggle: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: 3, marginBottom: spacing.lg, ...shadows.sm,
  },
  cycleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, alignItems: 'center' },
  cycleBtnActive: { backgroundColor: colors.primary },
  cycleBtnText: { ...typography.captionMedium, color: colors.textSecondary },
  cycleBtnTextActive: { color: '#fff' },
  sectionTitle: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md, marginTop: spacing.md,
  },
  planCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  planCardCurrent: { borderColor: colors.primary },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.md },
  planName: { ...typography.h4, color: colors.text },
  planPrice: { ...typography.h3, color: colors.text },
  planPeriod: { ...typography.caption, color: colors.textTertiary },
  featureList: { gap: spacing.xs, marginBottom: spacing.md },
  featureText: { ...typography.caption, color: colors.textSecondary, lineHeight: 20 },
  planBtn: { alignSelf: 'stretch' },
  currentLabel: { ...typography.captionMedium, color: colors.primary, textAlign: 'center' },
  invoiceRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.xs,
  },
  invoiceInfo: { flex: 1 },
  invoicePlan: { ...typography.captionMedium, color: colors.text },
  invoiceDate: { ...typography.small, color: colors.textTertiary },
  invoiceAmount: { ...typography.bodyMedium, color: colors.text },
  invoiceStatus: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  invoiceStatusText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize' },
});
