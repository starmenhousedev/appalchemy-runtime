import apiClient from '../client';
import type { ApiResponse, Plan, BillingRecord } from '../../types';

const FEATURE_LABELS: Record<string, string> = {
  analytics: 'Advanced analytics',
  custom_code: 'Custom code editor',
  white_label: 'White-label branding',
  integrations: 'Third-party integrations',
};

function normalizePlan(raw: any): Plan {
  const features: string[] = [];

  const limit = (n: unknown, label: string) =>
    typeof n === 'number' && n >= 0 ? `Up to ${n} ${label}` : `Unlimited ${label}`;

  if (raw?.max_pages !== undefined) features.push(limit(raw.max_pages, 'pages'));
  if (raw?.max_push_notifications !== undefined)
    features.push(limit(raw.max_push_notifications, 'push notifications/month'));

  if (raw?.features && typeof raw.features === 'object' && !Array.isArray(raw.features)) {
    for (const [key, enabled] of Object.entries(raw.features)) {
      if (enabled) features.push(FEATURE_LABELS[key] ?? key);
    }
  } else if (Array.isArray(raw?.features)) {
    features.push(...raw.features);
  }

  return { ...raw, features };
}

export const billingApi = {
  async getCurrentPlan() {
    const { data } = await apiClient.get<
      ApiResponse<{ billing: BillingRecord; plan: any } | null>
    >('/billing/plan');
    return data.data?.billing ?? null;
  },

  async listPlans(): Promise<Plan[]> {
    const { data } = await apiClient.get<ApiResponse<any>>('/billing/plans');
    const list = Array.isArray(data.data) ? data.data : [];
    return list.map(normalizePlan);
  },

  async subscribe(planId: number, billingCycle: 'monthly' | 'annual') {
    const { data } = await apiClient.post<
      ApiResponse<{ confirmation_url: string | null; billing: BillingRecord }>
    >('/billing/subscribe', { plan_id: planId, billing_cycle: billingCycle });
    return data.data;
  },

  async upgrade(planId: number, billingCycle: 'monthly' | 'annual') {
    const { data } = await apiClient.put<
      ApiResponse<{ confirmation_url: string | null; billing: BillingRecord }>
    >('/billing/plan/upgrade', { plan_id: planId, billing_cycle: billingCycle });
    return data.data;
  },

  async getInvoices() {
    const { data } = await apiClient.get<ApiResponse<BillingRecord[]>>(
      '/billing/invoices',
    );
    return data.data;
  },

  async confirmCharge(chargeId: string) {
    const { data } = await apiClient.post<ApiResponse<BillingRecord>>(
      '/billing/confirm-charge',
      { charge_id: chargeId },
    );
    return data.data;
  },

  async cancel() {
    const { data } = await apiClient.post<ApiResponse<BillingRecord>>(
      '/billing/cancel',
    );
    return data.data;
  },
};
