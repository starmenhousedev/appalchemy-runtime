import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { Section } from "../types";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../shopify/useProducts";
import type { StackParamList } from "../navigation/types";

type ProductListSection = Extract<Section, { type: "product_list" }>;

export function ProductList({ section }: { section: ProductListSection }) {
  const { source, maxItems, sort, layout } = section.config;
  const heading = section.config.title ?? section.title;
  const { products, loading, error } = useProducts(source, maxItems, sort);
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const goToProduct = (handle: string) =>
    navigation.navigate("ProductDetail", { handle });

  return (
    <View style={{ padding: 16 }}>
      {heading && (
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
          {heading}
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
      ) : layout === "horizontal" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              width={130}
              onPress={() => goToProduct(p.handle)}
            />
          ))}
        </ScrollView>
      ) : (
        products.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => goToProduct(p.handle)}
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 6,
                overflow: "hidden",
                backgroundColor: "#f4f4f4",
              }}
            >
              {p.featuredImage && (
                <Image
                  source={{ uri: p.featuredImage.url }}
                  style={{ width: 64, height: 64 }}
                  resizeMode="cover"
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: 14 }} numberOfLines={2}>
                {p.title}
              </Text>
              <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                {p.priceRange.minVariantPrice.currencyCode}{" "}
                {parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2)}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}
