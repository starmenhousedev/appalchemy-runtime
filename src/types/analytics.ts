export interface AnalyticsOverview {
  total_orders: number;
  total_sales: number;
  average_order_value: number;
  conversion_rate: number;
  active_users: number;
  new_app_users: number;
  comparison?: {
    total_orders: number;
    total_sales: number;
    average_order_value: number;
    conversion_rate: number;
    active_users: number;
    new_app_users: number;
  };
}

export interface DailyMetric {
  date: string;
  value: number;
  compare_value?: number;
}

export interface AppInstallData {
  platform: 'android' | 'ios';
  count: number;
}

export interface TopSource {
  source: string;
  count: number;
  percentage: number;
}

export interface TopDiscount {
  discount_id: number;
  title: string;
  usage_count: number;
  revenue: number;
}

export interface PushInsight {
  campaign_name: string;
  sent: number;
  clicked: number;
  add_to_cart: number;
  orders: number;
  revenue: number;
  status: string;
}

export interface ConversionFunnelStep {
  step: string;
  count: number;
  percentage: number;
}

export interface TopProduct {
  product_id: string;
  title: string;
  image: string;
  viewed: number;
  added_to_cart: number;
  wishlisted: number;
  purchased: number;
  revenue: number;
}

export interface AnalyticsQueryParams {
  date_from: string;
  date_to: string;
  compare_from?: string;
  compare_to?: string;
  platform?: 'android' | 'ios' | 'all';
}
