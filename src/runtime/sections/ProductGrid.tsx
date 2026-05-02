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
import type { StackParamList } from "../navigation/types";

type ProductGridSection = Extract<Section, { type: "product_grid" }>;

export function ProductGrid({ section }: { section: ProductGridSection }) {
  const { width } = useWindowDimensions();
  const { columns, maxItems, source, sort } = section.config;
  const padding = 16;
  const gap = 8;
  const tileWidth = (width - 2 * padding - gap * (columns - 1)) / columns;
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

  const { products, loading, error } = useProducts(source, maxItems, sort);

  return (
    <View style={{ padding }}>
      {section.title && (
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
          {section.title}
        </Text>
      )}
      {loading && products.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <Text style={{ fontSize: 12, color: "#b00", paddingVertical: 12 }}>
          Couldn't load products: {error.message}
        </Text>
      ) : products.length === 0 ? (
        <Text style={{ fontSize: 12, color: "#666", paddingVertical: 12 }}>
          No products to show.
        </Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              width={tileWidth}
              onPress={() => navigation.navigate("ProductDetail", { handle: p.handle })}
            />
          ))}
        </View>
      )}
    </View>
  );
}
