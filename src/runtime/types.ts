// Section schema for the AppAlchemy theme builder.
//
// Every section in a page has a `type` and a `config`. The `config` shape
// depends on `type`, expressed here as a discriminated union so the builder
// UI, runtime renderer, and backend all agree on the props each section
// needs.

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

// ───────────────────────────────────────────────────────────────────────────
// Shared building blocks
// ───────────────────────────────────────────────────────────────────────────

export type LinkTarget =
  | { kind: 'none' }
  | { kind: 'page'; pageSlug: string }
  | { kind: 'product'; productHandle: string }
  | { kind: 'collection'; collectionHandle: string }
  | { kind: 'url'; url: string };

export interface MediaImage {
  url: string;
  alt?: string;
  link?: LinkTarget;
}

export interface MediaVideo {
  url: string;
  poster?: string;
  link?: LinkTarget;
}

export type ProductSortKey =
  | 'default'
  | 'relevance'
  | 'just_launched'
  | 'best_selling'
  | 'price_high_low'
  | 'price_low_high'
  | 'alpha_az'
  | 'alpha_za';

export type ProductSource =
  | { kind: 'collection'; handle: string }
  | { kind: 'tag'; tag: string }
  | { kind: 'manual'; productHandles: string[] };

// ───────────────────────────────────────────────────────────────────────────
// Per-type config interfaces
// ───────────────────────────────────────────────────────────────────────────

export interface BannerConfig {
  image: MediaImage;
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | '9:16';
}

export interface VideoBannerConfig {
  video: MediaVideo;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
}

export interface YoutubeVideoConfig {
  videoId: string;
  autoplay: boolean;
  controls: boolean;
}

export interface CarouselConfig {
  slides: MediaImage[];
  autoplay: boolean;
  intervalMs: number;
  showIndicators: boolean;
}

export interface ImageMarqueeConfig {
  images: MediaImage[];
  speed: 'slow' | 'normal' | 'fast';
  direction: 'left' | 'right';
}

export interface ImageListConfig {
  images: MediaImage[];
  columns: 1 | 2 | 3 | 4;
  showCaption: boolean;
}

export interface VideoCarouselConfig {
  videos: MediaVideo[];
  autoplay: boolean;
  intervalMs: number;
}

export interface ImageCollageConfig {
  layout: 'grid_2x2' | 'hero_left' | 'hero_right' | 'three_stacked';
  images: MediaImage[];
}

export interface CountdownTimerConfig {
  title: string;
  targetAt: string; // ISO 8601
  expiredMessage: string;
}

export interface FaqConfig {
  items: Array<{ question: string; answer: string }>;
}

export interface MenuConfig {
  items: Array<{ label: string; icon?: string; link: LinkTarget }>;
}

export interface RichTextConfig {
  format: 'html' | 'markdown';
  content: string;
}

export interface AnnouncementsConfig {
  messages: string[];
  rotationIntervalMs: number;
}

export interface TickerConfig {
  message: string;
  speed: 'slow' | 'normal' | 'fast';
  direction: 'left' | 'right';
}

export interface TextListConfig {
  items: Array<{ text: string; link?: LinkTarget }>;
}

export interface TabbedProductListConfig {
  tabs: Array<{ label: string; source: ProductSource }>;
  maxPerTab: number;
  sort: ProductSortKey;
}

export interface ProductGridConfig {
  source: ProductSource;
  columns: 1 | 2 | 3;
  maxItems: number;
  showLabels: boolean;
  sort: ProductSortKey;
}

export interface PreviouslyOrderedConfig {
  title: string;
  maxItems: number;
  columns: 1 | 2 | 3;
}

export interface ProductListConfig {
  title?: string;
  source: ProductSource;
  maxItems: number;
  layout: 'horizontal' | 'vertical';
  sort: ProductSortKey;
}

export interface RecentlyViewedConfig {
  title: string;
  maxItems: number;
}

export interface WishlistedItemsConfig {
  title: string;
  maxItems: number;
}

// ───────────────────────────────────────────────────────────────────────────
// Discriminated union: Section
// ───────────────────────────────────────────────────────────────────────────

interface SectionBase {
  id: number;
  page_id: number;
  title: string;
  is_visible: boolean;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
}

export type Section =
  | (SectionBase & { type: 'banner'; config: BannerConfig })
  | (SectionBase & { type: 'video_banner'; config: VideoBannerConfig })
  | (SectionBase & { type: 'youtube_video'; config: YoutubeVideoConfig })
  | (SectionBase & { type: 'carousel'; config: CarouselConfig })
  | (SectionBase & { type: 'image_marquee'; config: ImageMarqueeConfig })
  | (SectionBase & { type: 'image_list'; config: ImageListConfig })
  | (SectionBase & { type: 'video_carousel'; config: VideoCarouselConfig })
  | (SectionBase & { type: 'image_collage'; config: ImageCollageConfig })
  | (SectionBase & { type: 'countdown_timer'; config: CountdownTimerConfig })
  | (SectionBase & { type: 'faq'; config: FaqConfig })
  | (SectionBase & { type: 'menu'; config: MenuConfig })
  | (SectionBase & { type: 'rich_text'; config: RichTextConfig })
  | (SectionBase & { type: 'announcements'; config: AnnouncementsConfig })
  | (SectionBase & { type: 'ticker'; config: TickerConfig })
  | (SectionBase & { type: 'text_list'; config: TextListConfig })
  | (SectionBase & { type: 'tabbed_product_list'; config: TabbedProductListConfig })
  | (SectionBase & { type: 'product_grid'; config: ProductGridConfig })
  | (SectionBase & { type: 'previously_ordered'; config: PreviouslyOrderedConfig })
  | (SectionBase & { type: 'product_list'; config: ProductListConfig })
  | (SectionBase & { type: 'recently_viewed'; config: RecentlyViewedConfig })
  | (SectionBase & { type: 'wishlisted_items'; config: WishlistedItemsConfig });

// Lookup table from `type` to its config interface — useful when the
// builder needs to pick the right form schema for a section being edited.
export interface SectionConfigByType {
  banner: BannerConfig;
  video_banner: VideoBannerConfig;
  youtube_video: YoutubeVideoConfig;
  carousel: CarouselConfig;
  image_marquee: ImageMarqueeConfig;
  image_list: ImageListConfig;
  video_carousel: VideoCarouselConfig;
  image_collage: ImageCollageConfig;
  countdown_timer: CountdownTimerConfig;
  faq: FaqConfig;
  menu: MenuConfig;
  rich_text: RichTextConfig;
  announcements: AnnouncementsConfig;
  ticker: TickerConfig;
  text_list: TextListConfig;
  tabbed_product_list: TabbedProductListConfig;
  product_grid: ProductGridConfig;
  previously_ordered: PreviouslyOrderedConfig;
  product_list: ProductListConfig;
  recently_viewed: RecentlyViewedConfig;
  wishlisted_items: WishlistedItemsConfig;
}
