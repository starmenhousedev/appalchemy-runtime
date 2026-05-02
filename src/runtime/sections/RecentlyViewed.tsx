import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { Section } from "../types";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../shopify/useProducts";
import { useRecentlyViewed } from "../recently-viewed/RecentlyViewedContext";
import type { StackParamList } from "../navigation/types";

type RecentlyViewedSection = Extract<Section, { type: "recently_viewed" }>;

export function RecentlyViewed({
  section,
}: {
  section: RecentlyViewedSection;
}) {
  const { handles } = useRecentlyViewed();
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const max = section.config.maxItems;

  if (handles.length === 0) {
    // Render nothing on a fresh install — RecentlyViewed should only
    // appear once the customer has actually browsed products.
    return null;
  }

  const { products, loading, error } = useProducts(
    { kind: "manual", productHandles: handles.slice(0, max) },
    max,
    "default",
  );

  return (
    <View style={{ paddingVertical: 16 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        {section.config.title}
      </Text>
      {loading && products.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <Text style={{ fontSize: 12, color: "#b00", paddingHorizontal: 16 }}>
          Couldn't load: {error.message}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              width={130}
              onPress={() =>
                navigation.navigate("ProductDetail", { handle: p.handle })
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
