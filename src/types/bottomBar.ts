import { Page } from './page';

export interface BottomBarItem {
  id: number;
  imported_theme_id: number;
  page_id: number;
  label: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  Page?: Page;
}
