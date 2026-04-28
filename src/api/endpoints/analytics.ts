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

function flattenDaily(payload: any): DailyMetric[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const current: DailyMetric[] = Array.isArray(payload.current) ? payload.current : [];
  const comparison: DailyMetric[] = Array.isArray(payload.comparison) ? payload.comparison : [];
  if (comparison.length === 0) return current;
  const compareByDate = new Map(comparison.map(c => [c.date, c.value]));
  return current.map(c => {
    const compare_value = compareByDate.get(c.date);
    return compare_value !== undefined ? { ...c, compare_value } : c;
  });
}

function unwrapList<T>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.current)) return payload.current;
  return [];
}

export const analyticsApi = {
  async overview(params: AnalyticsQueryParams): Promise<AnalyticsOverview> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/overview',
      buildParams(params),
    );
    const payload = data.data || {};
    const current = payload.current || payload;
    const comparison = payload.comparison || undefined;
    return { ...current, ...(comparison ? { comparison } : {}) };
  },

  async dailyOrders(params: AnalyticsQueryParams): Promise<DailyMetric[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/orders',
      buildParams(params),
    );
    return flattenDaily(data.data);
  },

  async dailySales(params: AnalyticsQueryParams): Promise<DailyMetric[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/sales',
      buildParams(params),
    );
    return flattenDaily(data.data);
  },

  async conversionRate(params: AnalyticsQueryParams): Promise<DailyMetric[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/conversion-rate',
      buildParams(params),
    );
    return flattenDaily(data.data);
  },

  async activeUsers(params: AnalyticsQueryParams): Promise<DailyMetric[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/active-users',
      buildParams(params),
    );
    return flattenDaily(data.data);
  },

  async newUsers(params: AnalyticsQueryParams): Promise<DailyMetric[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/new-users',
      buildParams(params),
    );
    return flattenDaily(data.data);
  },

  async dailySessions(params: AnalyticsQueryParams): Promise<DailyMetric[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/sessions',
      buildParams(params),
    );
    return flattenDaily(data.data);
  },

  async appInstalls(params: AnalyticsQueryParams): Promise<AppInstallData[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/app-installs',
      buildParams(params),
    );
    return unwrapList<AppInstallData>(data.data);
  },

  async topSources(params: AnalyticsQueryParams): Promise<TopSource[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/top-sources',
      buildParams(params),
    );
    return unwrapList<TopSource>(data.data);
  },

  async topDiscounts(params: AnalyticsQueryParams): Promise<TopDiscount[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/top-discounts',
      buildParams(params),
    );
    return unwrapList<TopDiscount>(data.data);
  },

  async pushInsights(params: AnalyticsQueryParams): Promise<PushInsight[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/push-insights',
      buildParams(params),
    );
    return unwrapList<PushInsight>(data.data);
  },

  async automatedPushInsights(params: AnalyticsQueryParams): Promise<PushInsight[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/automated-push',
      buildParams(params),
    );
    return unwrapList<PushInsight>(data.data);
  },

  async conversionFunnel(params: AnalyticsQueryParams): Promise<ConversionFunnelStep[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/conversion-funnel',
      buildParams(params),
    );
    return unwrapList<ConversionFunnelStep>(data.data);
  },

  async topProducts(params: AnalyticsQueryParams): Promise<TopProduct[]> {
    const { data } = await apiClient.get<ApiResponse<any>>(
      '/analytics/top-products',
      buildParams(params),
    );
    return unwrapList<TopProduct>(data.data);
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
