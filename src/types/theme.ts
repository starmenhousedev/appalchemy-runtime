export interface Theme {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  preview_images: string[];
  category: string;
  is_active: boolean;
  version: string;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ImportedTheme {
  id: number;
  shop_id: number;
  theme_id: number;
  name: string;
  is_active: boolean;
  is_pinned: boolean;
  scheduled_at: string | null;
  settings: ThemeSettings;
  code: string;
  createdAt: string;
  updatedAt: string;
  Theme?: Theme;
}

export interface ThemeSettings {
  product_labels?: ProductLabel[];
  product_sorting?: ProductSortingConfig;
  cart_goals?: CartGoal[];
  [key: string]: unknown;
}

export interface ProductLabel {
  id: string;
  label: string;
  color: string;
  condition: Record<string, unknown>;
}

export interface ProductSortingConfig {
  default_sort: string;
  options: string[];
}

export interface CartGoal {
  id: number;
  imported_theme_id: number;
  title: string;
  min_quantity: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  is_active: boolean;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeVersion {
  id: number;
  imported_theme_id: number;
  name: string;
  snapshot: Record<string, unknown>;
  created_by: number;
  createdAt: string;
}

export interface ThemeCalendarEntry {
  id: number;
  shop_id: number;
  imported_theme_id: number;
  title: string;
  activate_at: string;
  deactivate_at: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  ImportedTheme?: ImportedTheme;
}
