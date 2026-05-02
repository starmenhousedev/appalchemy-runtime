import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { storefrontQuery } from "../shopify/client";
import { PRODUCT_BY_HANDLE } from "../shopify/queries";
import { useCart } from "../shopify/CartContext";
import type {
  ProductDetail,
  ProductImage,
  ProductVariant,
} from "../shopify/types";
import type { StackParamList } from "./types";
import { track } from "../analytics";
import { useRecentlyViewed } from "../recently-viewed/RecentlyViewedContext";

interface RawProductDetail extends Omit<ProductDetail, "variants" | "images"> {
  variants: { nodes: ProductVariant[] };
  images: { nodes: ProductImage[] };
}

function unwrap(raw: RawProductDetail): ProductDetail {
  return {
    ...raw,
    variants: raw.variants.nodes,
    images: raw.images.nodes,
  };
}

function formatMoney(m: { amount: string; currencyCode: string }): string {
  const n = parseFloat(m.amount);
  if (Number.isNaN(n)) return m.amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: m.currencyCode,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${m.currencyCode} ${n.toFixed(2)}`;
  }
}

export function ProductDetailScreen() {
  const { params } = useRoute<RouteProp<StackParamList, "ProductDetail">>();
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const { width } = useWindowDimensions();
  const { addLine } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { pushView } = useRecentlyViewed();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    storefrontQuery<{ product: RawProductDetail | null }>(PRODUCT_BY_HANDLE, {
      handle: params.handle,
    })
      .then((data) => {
        if (cancelled) return;
        if (!data.product) {
          setError(new Error(`Product not found: ${params.handle}`));
        } else {
          const p = unwrap(data.product);
          setProduct(p);
          // Pre-select first available variant
          const firstAvailable =
            p.variants.find((v) => v.availableForSale) ?? p.variants[0];
          setVariantId(firstAvailable?.id ?? null);
          track("view_item", {
            product_id: p.id,
            handle: p.handle,
            title: p.title,
            price: p.priceRange.minVariantPrice.amount,
            currency: p.priceRange.minVariantPrice.currencyCode,
          });
          pushView(p.handle);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.handle]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontWeight: "600", marginBottom: 4 }}>
          Couldn't load product
        </Text>
        <Text style={{ color: "#666", fontSize: 12 }}>{error?.message}</Text>
      </View>
    );
  }

  const images = product.images.length > 0
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];
  const currentVariant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  function onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  async function onAddToCart() {
    if (!currentVariant) return;
    try {
      setAdding(true);
      await addLine(currentVariant.id, 1);
      navigation.navigate("Page", { pageId: -1 }); // sentinel; cart tab can be opened separately
    } finally {
      setAdding(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {images.length > 0 && (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
            >
              {images.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: img.url }}
                  style={{ width, height: width, backgroundColor: "#f4f4f4" }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i === imgIndex ? "#008060" : "#ccc",
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
            {product.title}
          </Text>
          {product.vendor ? (
            <Text style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>
              {product.vendor}
            </Text>
          ) : null}
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111" }}>
            {currentVariant ? formatMoney(currentVariant.price) : ""}
            {currentVariant?.compareAtPrice && (
              <Text style={{ color: "#888", fontSize: 14, textDecorationLine: "line-through", marginLeft: 8 }}>
                {"  "}
                {formatMoney(currentVariant.compareAtPrice)}
              </Text>
            )}
          </Text>

          {product.variants.length > 1 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: "600", marginBottom: 8 }}>Options</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {product.variants.map((v) => {
                    const isActive = v.id === variantId;
                    return (
                      <Pressable
                        key={v.id}
                        onPress={() => setVariantId(v.id)}
                        disabled={!v.availableForSale}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 14,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: isActive ? "#008060" : "#ddd",
                          backgroundColor: isActive ? "#008060" : "transparent",
                          opacity: v.availableForSale ? 1 : 0.4,
                        }}
                      >
                        <Text
                          style={{
                            color: isActive ? "#fff" : "#333",
                            fontSize: 13,
                          }}
                        >
                          {v.title}
                          {!v.availableForSale ? " (sold out)" : ""}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}

          {product.description ? (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: "600", marginBottom: 8 }}>Description</Text>
              <Text style={{ fontSize: 13, lineHeight: 20, color: "#333" }}>
                {product.description}
              </Text>
            </View>
          ) : null}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: "#eee",
          backgroundColor: "#fff",
        }}
      >
        <Pressable
          onPress={onAddToCart}
          disabled={!currentVariant?.availableForSale || adding}
          style={{
            backgroundColor: "#008060",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            opacity: !currentVariant?.availableForSale || adding ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
            {adding
              ? "Adding…"
              : !currentVariant?.availableForSale
                ? "Sold out"
                : "Add to cart"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
