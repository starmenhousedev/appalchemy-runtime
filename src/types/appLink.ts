export interface AppLink {
  id: number;
  shop_id: number;
  type: 'deeplink' | 'onelink';
  title: string;
  url: string;
  target_url: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
