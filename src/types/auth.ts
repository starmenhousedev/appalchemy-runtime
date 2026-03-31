export interface Shop {
  id: number;
  shop_domain: string;
  shop_name: string;
  email: string;
  plan_name: string;
  is_active: boolean;
  installed_at: string;
  uninstalled_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionData {
  shop: Shop;
}

export interface TokenResponse {
  token: string;
}
