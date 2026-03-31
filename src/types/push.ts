export type PushStatus = 'draft' | 'scheduled' | 'sent' | 'failed';
export type AutomatedPushType =
  | 'new_user'
  | 'abandoned_cart'
  | 'back_in_stock'
  | 'order_tracking';

export interface PushNotification {
  id: number;
  shop_id: number;
  title: string;
  message: string;
  image_url: string | null;
  link_url: string | null;
  status: PushStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  total_sent: number;
  total_clicked: number;
  total_cart: number;
  total_orders: number;
  total_revenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomatedPush {
  id: number;
  shop_id: number;
  type: AutomatedPushType;
  title: string;
  message: string;
  image_url: string | null;
  delay_minutes: number;
  is_active: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
