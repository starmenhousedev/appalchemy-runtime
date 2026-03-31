export type DiscountType =
  | 'amount_off_products'
  | 'amount_off_orders'
  | 'buy_x_get_y'
  | 'free_gift'
  | 'bundle'
  | 'coupon_code';

export type ProductSelection =
  | 'all'
  | 'with_tags'
  | 'except_tags'
  | 'selected_skus';

export interface Discount {
  id: number;
  shop_id: number;
  type: DiscountType;
  title: string;
  description: string;
  coupon_code: string | null;
  discount_value: number;
  discount_type: 'percentage' | 'fixed';
  terms_conditions: string | null;
  show_on_product_page: boolean;
  product_selection: ProductSelection;
  product_tags: string[];
  product_skus: string[];
  min_purchase_amount: number | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  gift_product_id: string | null;
  bundle_products: string[];
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  createdAt: string;
  updatedAt: string;
}
