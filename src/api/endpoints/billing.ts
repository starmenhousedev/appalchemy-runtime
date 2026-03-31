import apiClient from '../client';
import type { ApiResponse, Plan, BillingRecord } from '../../types';

export const billingApi = {
  async getCurrentPlan() {
    const { data } = await apiClient.get<ApiResponse<BillingRecord | null>>(
      '/billing/plan',
    );
    return data.data;
  },

  async listPlans() {
    const { data } = await apiClient.get<ApiResponse<Plan[]>>(
      '/billing/plans',
    );
    return data.data;
  },

  async subscribe(planId: number, billingCycle: 'monthly' | 'annual') {
    const { data } = await apiClient.post<
      ApiResponse<{ confirmation_url: string; billing: BillingRecord }>
    >('/billing/subscribe', { plan_id: planId, billing_cycle: billingCycle });
    return data.data;
  },

  async upgrade(planId: number) {
    const { data } = await apiClient.put<
      ApiResponse<{ confirmation_url: string; billing: BillingRecord }>
    >('/billing/plan/upgrade', { plan_id: planId });
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
