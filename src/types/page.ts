import { Section } from './section';

export type PageType =
  | 'blank'
  | 'product_collection'
  | 'blog'
  | 'reels'
  | 'tabbed_screen'
  | 'menu'
  | 'web_view'
  | 'home'
  | 'collection'
  | 'products'
  | 'product_list'
  | 'cart'
  | 'account'
  | 'contact_us'
  | 'grievance_policy'
  | 'privacy_policy'
  | 'refund_policy'
  | 'shipping_policy'
  | 'terms_conditions';

export interface Page {
  id: number;
  imported_theme_id: number;
  title: string;
  slug: string;
  type: PageType;
  is_visible: boolean;
  sort_order: number;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  Sections?: Section[];
}
