import apiClient from '../client';
import type {
  ApiResponse,
  AnalyticsOverview,
  DailyMetric,
  AppInstallData,
  TopSource,
  TopDiscount,
  PushInsight,
  ConversionFunnelStep,
  TopProduct,
  AnalyticsQueryParams,
} from '../../types';

function buildParams(params: AnalyticsQueryParams) {
  const query: Record<string, string> = {
    date_from: params.date_from,
    date_to: params.date_to,
  };
  if (params.compare_from) query.compare_from = params.compare_from;
  if (params.compare_to) query.compare_to = params.compare_to;
  if (params.platform && params.platform !== 'all')
    query.platform = params.platform;
  return { params: query };
}

export const analyticsApi = {
  async overview(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<AnalyticsOverview>>(
      '/analytics/overview',
      buildParams(params),
    );
    return data.data;
  },

  async dailyOrders(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<DailyMetric[]>>(
      '/analytics/orders',
      buildParams(params),
    );
    return data.data;
  },

  async dailySales(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<DailyMetric[]>>(
      '/analytics/sales',
      buildParams(params),
    );
    return data.data;
  },

  async conversionRate(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<DailyMetric[]>>(
      '/analytics/conversion-rate',
      buildParams(params),
    );
    return data.data;
  },

  async activeUsers(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<DailyMetric[]>>(
      '/analytics/active-users',
      buildParams(params),
    );
    return data.data;
  },

  async newUsers(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<DailyMetric[]>>(
      '/analytics/new-users',
      buildParams(params),
    );
    return data.data;
  },

  async dailySessions(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<DailyMetric[]>>(
      '/analytics/sessions',
      buildParams(params),
    );
    return data.data;
  },

  async appInstalls(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<AppInstallData[]>>(
      '/analytics/app-installs',
      buildParams(params),
    );
    return data.data;
  },

  async topSources(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<TopSource[]>>(
      '/analytics/top-sources',
      buildParams(params),
    );
    return data.data;
  },

  async topDiscounts(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<TopDiscount[]>>(
      '/analytics/top-discounts',
      buildParams(params),
    );
    return data.data;
  },

  async pushInsights(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<PushInsight[]>>(
      '/analytics/push-insights',
      buildParams(params),
    );
    return data.data;
  },

  async automatedPushInsights(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<PushInsight[]>>(
      '/analytics/automated-push',
      buildParams(params),
    );
    return data.data;
  },

  async conversionFunnel(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<ConversionFunnelStep[]>>(
      '/analytics/conversion-funnel',
      buildParams(params),
    );
    return data.data;
  },

  async topProducts(params: AnalyticsQueryParams) {
    const { data } = await apiClient.get<ApiResponse<TopProduct[]>>(
      '/analytics/top-products',
      buildParams(params),
    );
    return data.data;
  },

  async trackEvent(event: {
    event_type: string;
    platform: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data } = await apiClient.post<ApiResponse<null>>(
      '/analytics/events',
      event,
    );
    return data;
  },
};
