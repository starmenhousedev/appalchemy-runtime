export const API_BASE_URL = 'https://analytics.deodap.in/api';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@appalchemy_token',
  SHOP_DOMAIN: '@appalchemy_shop',
  SELECTED_DEVICE: '@appalchemy_device',
} as const;

export const PAGE_TYPES = [
  { value: 'blank', label: 'Blank' },
  { value: 'product_collection', label: 'Product Collection' },
  { value: 'blog', label: 'Shopify Blog Page' },
  { value: 'reels', label: 'Reels Page' },
  { value: 'tabbed_screen', label: 'Tabbed Screen' },
  { value: 'menu', label: 'Menu Page' },
  { value: 'web_view', label: 'Web View' },
] as const;

export const SECTION_TYPES = [
  { value: 'banner', label: 'Banner' },
  { value: 'video_banner', label: 'Video Banner' },
  { value: 'youtube_video', label: 'YouTube Video' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'image_marquee', label: 'Image Marquee' },
  { value: 'image_list', label: 'Image List' },
  { value: 'video_carousel', label: 'Video Carousel' },
  { value: 'image_collage', label: 'Image Collage' },
  { value: 'countdown_timer', label: 'Countdown Timer' },
  { value: 'faq', label: 'FAQs' },
  { value: 'menu', label: 'Menu' },
  { value: 'rich_text', label: 'Rich Text' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'ticker', label: 'Ticker' },
  { value: 'text_list', label: 'Text List' },
  { value: 'tabbed_product_list', label: 'Tabbed Product List' },
  { value: 'product_grid', label: 'Product Grid' },
  { value: 'previously_ordered', label: 'Previously Ordered Products' },
  { value: 'product_list', label: 'Product List' },
  { value: 'recently_viewed', label: 'Recently Viewed Products' },
  { value: 'wishlisted_items', label: 'Wishlisted Items' },
] as const;

export const DISCOUNT_TYPES = [
  { value: 'amount_off_products', label: 'Amount Off Products' },
  { value: 'amount_off_orders', label: 'Amount Off Orders' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y Free' },
  { value: 'free_gift', label: 'Free Gift with Purchase' },
  { value: 'bundle', label: 'Bundle Discount' },
  { value: 'coupon_code', label: 'Coupon Codes' },
] as const;

export const PRODUCT_SORTING_OPTIONS = [
  { value: 'default', label: 'Default (Shopify Order)' },
  { value: 'relevance', label: 'Relevance' },
  { value: 'just_launched', label: 'Just Launched' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'alpha_az', label: 'Alphabetically: A-Z' },
  { value: 'alpha_za', label: 'Alphabetically: Z-A' },
] as const;

export const INTEGRATION_PROVIDERS = [
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'gokwik', label: 'GoKwik' },
  { value: 'judgeme', label: 'Judge.me' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'facebook_ads', label: 'Facebook Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'unicommerce', label: 'Unicommerce' },
  { value: 'omsguru', label: 'OMSGuru' },
] as const;

export const USER_ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
] as const;

export const AUTOMATED_PUSH_TYPES = [
  { value: 'new_user', label: 'New User' },
  { value: 'abandoned_cart', label: 'Abandoned Cart' },
  { value: 'back_in_stock', label: 'Back in Stock' },
  { value: 'order_tracking', label: 'Order Tracking' },
] as const;
