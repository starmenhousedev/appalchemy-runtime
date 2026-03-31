export interface Plan {
  id: number;
  name: string;
  slug: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
  max_push_notifications: number;
  max_pages: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRecord {
  id: number;
  shop_id: number;
  plan_id: number;
  shopify_charge_id: string | null;
  plan_name: string;
  price: number;
  status: 'pending' | 'active' | 'cancelled' | 'expired' | 'declined';
  activated_at: string | null;
  cancelled_at: string | null;
  billing_cycle: 'monthly' | 'annual';
  createdAt: string;
  updatedAt: string;
  Plan?: Plan;
}
