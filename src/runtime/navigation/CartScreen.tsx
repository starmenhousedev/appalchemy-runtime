import React from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../shopify/CartContext";
import type { StackParamList } from "./types";
import { track } from "../analytics";

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

export function CartScreen() {
  const { cart, loading, updateLine, removeLine } = useCart();
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

  if (loading && !cart) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🛒</Text>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
          Your cart is empty
        </Text>
        <Text style={{ color: "#666", textAlign: "center" }}>
          Browse products and tap "Add to cart" to start a checkout.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {cart.lines.map((line) => (
          <View
            key={line.id}
            style={{
              flexDirection: "row",
              gap: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 6,
                backgroundColor: "#f4f4f4",
                overflow: "hidden",
              }}
            >
              {line.merchandise.image && (
                <Image
                  source={{ uri: line.merchandise.image.url }}
                  style={{ width: 64, height: 64 }}
                  resizeMode="cover"
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", fontSize: 14 }} numberOfLines={2}>
                {line.merchandise.product.title}
              </Text>
              {line.merchandise.title !== "Default Title" && (
                <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                  {line.merchandise.title}
                </Text>
              )}
              <Text style={{ fontSize: 13, marginTop: 4, fontWeight: "500" }}>
                {formatMoney(line.cost.totalAmount)}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <QuantityButton
                  label="−"
                  onPress={() => updateLine(line.id, line.quantity - 1)}
                  disabled={line.quantity <= 1}
                />
                <Text style={{ minWidth: 24, textAlign: "center" }}>
                  {line.quantity}
                </Text>
                <QuantityButton
                  label="+"
                  onPress={() => updateLine(line.id, line.quantity + 1)}
                />
                <Pressable onPress={() => removeLine(line.id)} style={{ marginLeft: 8 }}>
                  <Text style={{ color: "#b91c1c", fontSize: 12 }}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: "#eee",
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: "#666" }}>
            Subtotal ({cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"})
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "600" }}>
            {formatMoney(cart.cost.subtotalAmount)}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            track("begin_checkout", {
              cart_id: cart.id,
              total_quantity: cart.totalQuantity,
              subtotal: cart.cost.subtotalAmount.amount,
              currency: cart.cost.subtotalAmount.currencyCode,
            });
            navigation.navigate("WebView", {
              url: cart.checkoutUrl,
              title: "Checkout",
            });
          }}
          style={{
            backgroundColor: "#008060",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
            Checkout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function QuantityButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "500" }}>{label}</Text>
    </Pressable>
  );
}
