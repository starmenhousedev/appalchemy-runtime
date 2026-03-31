export type SectionType =
  | 'banner'
  | 'video_banner'
  | 'youtube_video'
  | 'carousel'
  | 'image_marquee'
  | 'image_list'
  | 'video_carousel'
  | 'image_collage'
  | 'countdown_timer'
  | 'faq'
  | 'menu'
  | 'rich_text'
  | 'announcements'
  | 'ticker'
  | 'text_list'
  | 'tabbed_product_list'
  | 'product_grid'
  | 'previously_ordered'
  | 'product_list'
  | 'recently_viewed'
  | 'wishlisted_items';

export interface Section {
  id: number;
  page_id: number;
  type: SectionType;
  title: string;
  is_visible: boolean;
  sort_order: number;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
