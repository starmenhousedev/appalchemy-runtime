import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, borderRadius, spacing } from '../../theme';
import type { Section, SectionType } from '../../types';

interface SectionRendererProps {
  section: Section;
  screenWidth: number;
}

export function SectionRenderer({ section, screenWidth }: SectionRendererProps) {
  const config = section.config || {};
  const renderer = RENDERERS[section.type] || renderGeneric;
  return (
    <View style={styles.sectionWrapper}>
      {renderer(section, config, screenWidth)}
    </View>
  );
}

function renderGeneric(section: Section) {
  return (
    <View style={styles.generic}>
      <View style={styles.genericIcon}>
        <Text style={styles.genericIconText}>
          {section.type.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.genericTitle}>{section.title || section.type}</Text>
      <Text style={styles.genericType}>
        {section.type.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

function renderBanner(section: Section, config: Record<string, unknown>) {
  const imageUrl = config.image_url as string | undefined;
  return (
    <View style={styles.banner}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.bannerImage} resizeMode="cover" />
      ) : (
        <View style={styles.bannerPlaceholder}>
          <Text style={styles.placeholderText}>Banner Image</Text>
        </View>
      )}
    </View>
  );
}

function renderVideoBanner(section: Section, config: Record<string, unknown>) {
  return (
    <View style={styles.banner}>
      <View style={[styles.bannerPlaceholder, { backgroundColor: '#1A1A2E' }]}>
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <Text style={[styles.placeholderText, { color: '#FFF' }]}>Video Banner</Text>
      </View>
    </View>
  );
}

function renderYoutubeVideo() {
  return (
    <View style={styles.videoContainer}>
      <View style={styles.youtubeFrame}>
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        <Text style={[styles.placeholderText, { color: '#FFF' }]}>YouTube Video</Text>
      </View>
    </View>
  );
}

function renderCarousel(section: Section, config: Record<string, unknown>) {
  const images = (config.images as string[]) || [];
  return (
    <View style={styles.carousel}>
      <View style={styles.carouselTrack}>
        {(images.length > 0 ? images.slice(0, 3) : [1, 2, 3]).map((item, i) => (
          <View key={i} style={styles.carouselSlide}>
            {typeof item === 'string' ? (
              <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
            ) : (
              <View style={[styles.carouselPlaceholder, { backgroundColor: i === 0 ? colors.primaryLight : i === 1 ? colors.secondaryLight : colors.warningLight }]}>
                <Text style={styles.slideNum}>{i + 1}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      <View style={styles.carouselDots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function renderImageMarquee() {
  return (
    <View style={styles.marquee}>
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.marqueeItem}>
          <View style={[styles.marqueeImage, { backgroundColor: `hsl(${i * 60}, 70%, 85%)` }]} />
        </View>
      ))}
    </View>
  );
}

function renderImageList() {
  return (
    <View style={styles.imageListContainer}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.imageListRow}>
          <View style={[styles.imageListItem, { backgroundColor: `hsl(${i * 90}, 60%, 88%)` }]} />
        </View>
      ))}
    </View>
  );
}

function renderVideoCarousel() {
  return (
    <View style={styles.carousel}>
      <View style={styles.carouselTrack}>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.carouselSlide, { backgroundColor: '#1A1A2E' }]}>
            <View style={styles.miniPlayBtn}>
              <Text style={{ color: '#FFF', fontSize: 8 }}>▶</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderImageCollage() {
  return (
    <View style={styles.collage}>
      <View style={[styles.collageMain, { backgroundColor: colors.primaryLight }]} />
      <View style={styles.collageSide}>
        <View style={[styles.collageSm, { backgroundColor: colors.secondaryLight }]} />
        <View style={[styles.collageSm, { backgroundColor: colors.warningLight }]} />
      </View>
    </View>
  );
}

function renderCountdownTimer() {
  return (
    <View style={styles.countdown}>
      <Text style={styles.countdownLabel}>SALE ENDS IN</Text>
      <View style={styles.countdownRow}>
        {['02', '14', '36', '52'].map((val, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Text style={styles.countdownSep}>:</Text>}
            <View style={styles.countdownBox}>
              <Text style={styles.countdownValue}>{val}</Text>
              <Text style={styles.countdownUnit}>
                {['Days', 'Hrs', 'Min', 'Sec'][i]}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function renderFaq() {
  return (
    <View style={styles.faqContainer}>
      <Text style={styles.faqTitle}>FAQs</Text>
      {['How do I track my order?', 'What is the return policy?', 'How to contact support?'].map((q, i) => (
        <View key={i} style={styles.faqItem}>
          <Text style={styles.faqQuestion}>{q}</Text>
          <Text style={styles.faqChevron}>+</Text>
        </View>
      ))}
    </View>
  );
}

function renderMenu() {
  return (
    <View style={styles.menuContainer}>
      {['Shop All', 'New Arrivals', 'Best Sellers', 'Sale'].map((item, i) => (
        <View key={i} style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: `hsl(${i * 70 + 200}, 60%, 85%)` }]} />
          <Text style={styles.menuLabel}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function renderRichText(section: Section, config: Record<string, unknown>) {
  const text = (config.content as string) || 'Rich text content goes here. This section supports formatted text, headings, and links.';
  return (
    <View style={styles.richText}>
      <Text style={styles.richTextContent}>{text}</Text>
    </View>
  );
}

function renderAnnouncements() {
  return (
    <View style={styles.announcement}>
      <Text style={styles.announcementText}>
        Free shipping on orders over $50! Use code: SHIP50
      </Text>
    </View>
  );
}

function renderTicker() {
  return (
    <View style={styles.ticker}>
      <Text style={styles.tickerText}>
        🔥 Flash Sale • 50% OFF • Limited Time • Shop Now • Free Returns 🔥
      </Text>
    </View>
  );
}

function renderTextList() {
  return (
    <View style={styles.textListContainer}>
      {['Feature 1: Free Shipping', 'Feature 2: 30 Day Returns', 'Feature 3: 24/7 Support'].map((item, i) => (
        <View key={i} style={styles.textListItem}>
          <View style={styles.textListBullet} />
          <Text style={styles.textListText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function renderTabbedProductList() {
  return (
    <View style={styles.tabbedProducts}>
      <View style={styles.tabRow}>
        {['All', 'Popular', 'New'].map((tab, i) => (
          <View key={tab} style={[styles.tab, i === 0 && styles.tabActive]}>
            <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{tab}</Text>
          </View>
        ))}
      </View>
      <View style={styles.productRow}>
        {[1, 2].map(i => renderProductCard(i))}
      </View>
    </View>
  );
}

function renderProductGrid() {
  return (
    <View style={styles.productGrid}>
      <Text style={styles.sectionLabel}>Products</Text>
      <View style={styles.productRow}>
        {[1, 2].map(i => renderProductCard(i))}
      </View>
      <View style={styles.productRow}>
        {[3, 4].map(i => renderProductCard(i))}
      </View>
    </View>
  );
}

function renderProductList() {
  return (
    <View style={styles.productListContainer}>
      <Text style={styles.sectionLabel}>Products</Text>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.productListItem}>
          <View style={[styles.productListImage, { backgroundColor: `hsl(${i * 50 + 180}, 50%, 88%)` }]} />
          <View style={styles.productListInfo}>
            <Text style={styles.productName}>Product {i}</Text>
            <Text style={styles.productPrice}>${(i * 19.99).toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function renderPreviouslyOrdered() {
  return (
    <View style={styles.productGrid}>
      <Text style={styles.sectionLabel}>Previously Ordered</Text>
      <View style={styles.productRow}>
        {[1, 2].map(i => renderProductCard(i))}
      </View>
    </View>
  );
}

function renderRecentlyViewed() {
  return (
    <View style={styles.carousel}>
      <Text style={[styles.sectionLabel, { paddingHorizontal: 8 }]}>Recently Viewed</Text>
      <View style={styles.carouselTrack}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.recentItem}>
            <View style={[styles.recentImage, { backgroundColor: `hsl(${i * 40 + 100}, 45%, 85%)` }]} />
            <Text style={styles.recentName}>Item {i}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderWishlistedItems() {
  return (
    <View style={styles.productGrid}>
      <Text style={styles.sectionLabel}>Wishlisted Items</Text>
      <View style={styles.productRow}>
        {[1, 2].map(i => (
          <View key={i} style={styles.productCard}>
            <View style={[styles.productImage, { backgroundColor: `hsl(${i * 30 + 330}, 50%, 88%)` }]}>
              <Text style={styles.heartIcon}>♥</Text>
            </View>
            <Text style={styles.productName}>Wishlist {i}</Text>
            <Text style={styles.productPrice}>${(i * 24.99).toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderProductCard(index: number) {
  return (
    <View key={index} style={styles.productCard}>
      <View style={[styles.productImage, { backgroundColor: `hsl(${index * 50 + 180}, 50%, 88%)` }]} />
      <Text style={styles.productName}>Product {index}</Text>
      <Text style={styles.productPrice}>${(index * 19.99).toFixed(2)}</Text>
    </View>
  );
}

const RENDERERS: Record<SectionType, (section: Section, config: Record<string, unknown>, screenWidth: number) => React.ReactNode> = {
  banner: renderBanner,
  video_banner: renderVideoBanner,
  youtube_video: renderYoutubeVideo,
  carousel: renderCarousel,
  image_marquee: renderImageMarquee,
  image_list: renderImageList,
  video_carousel: renderVideoCarousel,
  image_collage: renderImageCollage,
  countdown_timer: renderCountdownTimer,
  faq: renderFaq,
  menu: renderMenu,
  rich_text: renderRichText,
  announcements: renderAnnouncements,
  ticker: renderTicker,
  text_list: renderTextList,
  tabbed_product_list: renderTabbedProductList,
  product_grid: renderProductGrid,
  previously_ordered: renderPreviouslyOrdered,
  product_list: renderProductList,
  recently_viewed: renderRecentlyViewed,
  wishlisted_items: renderWishlistedItems,
};

const styles = StyleSheet.create({
  sectionWrapper: {
    marginBottom: 2,
  },
  // Generic
  generic: {
    padding: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    gap: 4,
  },
  genericIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genericIconText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  genericTitle: { fontSize: 10, fontWeight: '500', color: colors.text },
  genericType: { fontSize: 8, color: colors.textTertiary, textTransform: 'capitalize' },
  // Banner
  banner: { width: '100%' },
  bannerImage: { width: '100%', height: 140 },
  bannerPlaceholder: {
    width: '100%', height: 140, backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  placeholderText: { fontSize: 11, color: colors.primary, fontWeight: '500' },
  // Video
  videoContainer: { width: '100%' },
  youtubeFrame: {
    width: '100%', height: 120, backgroundColor: '#1A1A2E',
    justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  playButton: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  playIcon: { color: '#FFF', fontSize: 12 },
  miniPlayBtn: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  // Carousel
  carousel: { paddingVertical: 8 },
  carouselTrack: { flexDirection: 'row', paddingHorizontal: 8, gap: 6 },
  carouselSlide: { width: 100, height: 80, borderRadius: 8, overflow: 'hidden' },
  carouselImage: { width: '100%', height: '100%' },
  carouselPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  slideNum: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  carouselDots: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 6 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.textTertiary, opacity: 0.3 },
  dotActive: { backgroundColor: colors.primary, opacity: 1, width: 14 },
  // Marquee
  marquee: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, gap: 6 },
  marqueeItem: { flex: 1 },
  marqueeImage: { height: 50, borderRadius: 6 },
  // Image List
  imageListContainer: { padding: 8, gap: 6 },
  imageListRow: {},
  imageListItem: { height: 60, borderRadius: 8 },
  // Collage
  collage: { flexDirection: 'row', height: 120, padding: 8, gap: 4 },
  collageMain: { flex: 2, borderRadius: 8 },
  collageSide: { flex: 1, gap: 4 },
  collageSm: { flex: 1, borderRadius: 8 },
  // Countdown
  countdown: { padding: 12, backgroundColor: '#1A1A2E', alignItems: 'center' },
  countdownLabel: { fontSize: 9, color: '#FFF', fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  countdownRow: { flexDirection: 'row', alignItems: 'center' },
  countdownBox: { alignItems: 'center', marginHorizontal: 4 },
  countdownValue: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  countdownUnit: { fontSize: 7, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  countdownSep: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  // FAQ
  faqContainer: { padding: 10 },
  faqTitle: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  faqItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight,
  },
  faqQuestion: { fontSize: 10, color: colors.text, flex: 1 },
  faqChevron: { fontSize: 12, color: colors.textTertiary },
  // Menu
  menuContainer: { flexDirection: 'row', padding: 10, gap: 8 },
  menuItem: { flex: 1, alignItems: 'center', gap: 4 },
  menuIcon: { width: 36, height: 36, borderRadius: 18 },
  menuLabel: { fontSize: 8, color: colors.text, fontWeight: '500' },
  // Rich text
  richText: { padding: 12 },
  richTextContent: { fontSize: 10, color: colors.textSecondary, lineHeight: 15 },
  // Announcement
  announcement: {
    backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center',
  },
  announcementText: { fontSize: 9, color: '#FFF', fontWeight: '500', textAlign: 'center' },
  // Ticker
  ticker: {
    backgroundColor: '#1A1A2E', paddingVertical: 6, paddingHorizontal: 12,
  },
  tickerText: { fontSize: 9, color: '#FFF', textAlign: 'center' },
  // Text List
  textListContainer: { padding: 10, gap: 6 },
  textListItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textListBullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  textListText: { fontSize: 10, color: colors.text },
  // Tabbed product list
  tabbedProducts: { paddingVertical: 8 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 6, marginBottom: 8 },
  tab: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 9, color: colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: '#FFF' },
  // Product grid & cards
  productGrid: { padding: 8 },
  productRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  productCard: { flex: 1 },
  productImage: { height: 70, borderRadius: 6, marginBottom: 4 },
  productName: { fontSize: 9, color: colors.text, fontWeight: '500' },
  productPrice: { fontSize: 9, color: colors.primary, fontWeight: '600' },
  heartIcon: { position: 'absolute', top: 4, right: 4, fontSize: 10, color: colors.error },
  // Section label
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 },
  // Product list (vertical)
  productListContainer: { padding: 8 },
  productListItem: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  productListImage: { width: 50, height: 50, borderRadius: 6 },
  productListInfo: { flex: 1 },
  // Recently viewed
  recentItem: { width: 80, marginRight: 6, alignItems: 'center' },
  recentImage: { width: 80, height: 60, borderRadius: 6, marginBottom: 4 },
  recentName: { fontSize: 8, color: colors.text },
});
