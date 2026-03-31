export type NavigationItemType =
  | 'link'
  | 'page'
  | 'collection'
  | 'product'
  | 'external'
  | 'custom';

export interface NavigationItem {
  id: number;
  imported_theme_id: number;
  title: string;
  type: NavigationItemType;
  target: string;
  icon: string | null;
  parent_id: number | null;
  sort_order: number;
  is_visible: boolean;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PreviewDevice {
  id: string;
  brand: string;
  model: string;
  width: number;
  height: number;
  has_notch: boolean;
}
