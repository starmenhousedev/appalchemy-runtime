import React from "react";
import { Text, View } from "react-native";
import type { Section, SectionType } from "../types";
import { Announcements } from "./Announcements";
import { Banner } from "./Banner";
import { Carousel } from "./Carousel";
import { CountdownTimer } from "./CountdownTimer";
import { Faq } from "./Faq";
import { ImageCollage } from "./ImageCollage";
import { ImageList } from "./ImageList";
import { ImageMarquee } from "./ImageMarquee";
import { Menu } from "./Menu";
import { PreviouslyOrdered } from "./PreviouslyOrdered";
import { ProductGrid } from "./ProductGrid";
import { ProductList } from "./ProductList";
import { RecentlyViewed } from "./RecentlyViewed";
import { RichText } from "./RichText";
import { TabbedProductList } from "./TabbedProductList";
import { TextList } from "./TextList";
import { Ticker } from "./Ticker";
import { VideoBanner } from "./VideoBanner";
import { VideoCarousel } from "./VideoCarousel";
import { WishlistedItems } from "./WishlistedItems";
import { YoutubeVideo } from "./YoutubeVideo";

// Registry mapping section type → React component. All 21 types wired.
//
// Step 4 swaps placeholder data in product-related components for real
// Shopify Storefront API calls.

type SectionComponentMap = {
  [K in SectionType]: React.ComponentType<{ section: Extract<Section, { type: K }> }>;
};

export const SECTION_COMPONENTS: SectionComponentMap = {
  banner: Banner,
  video_banner: VideoBanner,
  youtube_video: YoutubeVideo,
  carousel: Carousel,
  image_marquee: ImageMarquee,
  image_list: ImageList,
  video_carousel: VideoCarousel,
  image_collage: ImageCollage,
  countdown_timer: CountdownTimer,
  faq: Faq,
  menu: Menu,
  rich_text: RichText,
  announcements: Announcements,
  ticker: Ticker,
  text_list: TextList,
  tabbed_product_list: TabbedProductList,
  product_grid: ProductGrid,
  previously_ordered: PreviouslyOrdered,
  product_list: ProductList,
  recently_viewed: RecentlyViewed,
  wishlisted_items: WishlistedItems,
};

export function renderSection(section: Section) {
  const Component = SECTION_COMPONENTS[section.type] as
    | React.ComponentType<{ section: Section }>
    | undefined;
  if (!Component) {
    return <UnknownSection section={section} />;
  }
  return <Component section={section} />;
}

// If the published theme JSON contains a section type the binary doesn't
// know about (because it was added to the schema after this binary
// shipped), fall through to a stub instead of crashing.
function UnknownSection({ section }: { section: Section }) {
  return (
    <View
      style={{
        padding: 16,
        margin: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fafafa",
      }}
    >
      <Text style={{ fontWeight: "600", marginBottom: 4 }}>{section.title}</Text>
      <Text style={{ fontSize: 12, color: "#666" }}>
        Section type "{section.type}" not supported by this app version.
        Please update the app from the App Store / Play Store.
      </Text>
    </View>
  );
}
