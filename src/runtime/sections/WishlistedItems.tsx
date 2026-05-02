import React from "react";
import {
  ActivityIndicator,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { Section } from "../types";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../shopify/useProducts";
import { useWishlist } from "../wishlist/WishlistContext";
import type { StackParamList } from "../navigation/types";

type WishlistedItemsSection = Extract<Section, { type: "wishlisted_items" }>;

export function WishlistedItems({
  section,
}: {
  section: WishlistedItemsSection;
}) {
  const { width } = useWindowDimensions();
  const padding = 16;
  const gap = 8;
  const cols = 2;
  const tileWidth = (width - 2 * padding - gap * (cols - 1)) / cols;
  const max = section.config.maxItems;

  const { handles } = useWishlist();
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

  // No wishlist items yet → render empty state without firing a Storefront query.
  if (handles.length === 0) {
    return (
      <View style={{ padding }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          {section.config.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#666" }}>
          Tap the ♡ on any product to save it here.
        </Text>
      </View>
    );
  }

  const { products, loading, error } = useProducts(
    { kind: "manual", productHandles: handles.slice(0, max) },
    max,
    "default",
  );

  return (
    <View style={{ padding }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
        {section.config.title}
      </Text>
      {loading && products.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <Text style={{ fontSize: 12, color: "#b00" }}>
          Couldn't load wishlist: {error.message}
        </Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              width={tileWidth}
              onPress={() =>
                navigation.navigate("ProductDetail", { handle: p.handle })
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}
