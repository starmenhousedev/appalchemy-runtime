import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { Product } from "../shopify/types";
import { useWishlist } from "../wishlist/WishlistContext";

interface Props {
  product: Product;
  width: number;
  imageHeight?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function formatMoney({
  amount,
  currencyCode,
}: {
  amount: string;
  currencyCode: string;
}): string {
  const num = parseFloat(amount);
  if (Number.isNaN(num)) return amount;
  // Use Intl when available; fall back to a simple currency-prefix string.
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currencyCode} ${num.toFixed(2)}`;
  }
}

export function ProductCard({ product, width, imageHeight, onPress, style }: Props) {
  const price = product.priceRange.minVariantPrice;
  const compare = product.compareAtPriceRange?.minVariantPrice ?? null;
  const onSale =
    compare && parseFloat(compare.amount) > parseFloat(price.amount);

  const imageH = imageHeight ?? width;
  const { isWishlisted, toggle } = useWishlist();
  const wished = isWishlisted(product.handle);

  return (
    <Pressable onPress={onPress} style={style}>
      <View style={{ width }}>
        <View
          style={{
            width,
            height: imageH,
            borderRadius: 8,
            backgroundColor: "#f4f4f4",
            overflow: "hidden",
          }}
        >
          {product.featuredImage ? (
            <Image
              source={{ uri: product.featuredImage.url }}
              style={{ width, height: imageH }}
              resizeMode="cover"
              accessibilityLabel={product.featuredImage.altText ?? product.title}
            />
          ) : null}
          {onSale && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "#b91c1c",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                SALE
              </Text>
            </View>
          )}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              toggle(product.handle);
            }}
            hitSlop={8}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: "rgba(255,255,255,0.92)",
              justifyContent: "center",
              alignItems: "center",
            }}
            accessibilityLabel={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Text
              style={{
                fontSize: 16,
                color: wished ? "#dc2626" : "#999",
              }}
            >
              {wished ? "♥" : "♡"}
            </Text>
          </Pressable>
        </View>
        <Text
          style={{ fontSize: 13, marginTop: 6, fontWeight: "500" }}
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 1 }}>
          <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>
            {formatMoney(price)}
          </Text>
          {onSale && compare && (
            <Text
              style={{
                fontSize: 11,
                color: "#888",
                textDecorationLine: "line-through",
              }}
            >
              {formatMoney(compare)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
