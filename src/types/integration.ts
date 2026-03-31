export type IntegrationProvider =
  | 'razorpay'
  | 'gokwik'
  | 'judgeme'
  | 'shopify'
  | 'facebook_ads'
  | 'google_ads'
  | 'unicommerce'
  | 'omsguru';

export interface Integration {
  id: number;
  shop_id: number;
  provider: IntegrationProvider;
  is_connected: boolean;
  credentials: Record<string, unknown>;
  settings: Record<string, unknown>;
  connected_at: string | null;
  createdAt: string;
  updatedAt: string;
}
