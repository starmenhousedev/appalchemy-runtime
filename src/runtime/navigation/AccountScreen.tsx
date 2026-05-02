import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useCustomer } from "../customer/CustomerContext";
import { storefrontQuery } from "../shopify/client";
import { CUSTOMER_ORDERS_QUERY } from "../customer/queries";
import type { CustomerOrder } from "../customer/types";
import type { StackParamList } from "./types";

interface RawOrder extends Omit<CustomerOrder, "lineItems"> {
  lineItems: { nodes: CustomerOrder["lineItems"] };
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

export function AccountScreen() {
  const { customer, accessToken, loading, logout } = useCustomer();
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    setOrdersLoading(true);
    storefrontQuery<{
      customer: { orders: { nodes: RawOrder[] } } | null;
    }>(CUSTOMER_ORDERS_QUERY, { accessToken, first: 20 })
      .then((data) => {
        if (cancelled) return;
        const raw = data.customer?.orders.nodes ?? [];
        setOrders(
          raw.map((o) => ({ ...o, lineItems: o.lineItems.nodes })),
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
          Account
        </Text>
        <Text style={{ color: "#666", marginBottom: 24 }}>
          Log in to view your orders, manage your wishlist, and check out
          faster.
        </Text>
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={{
            backgroundColor: "#008060",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Log in</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={{
            borderWidth: 1,
            borderColor: "#008060",
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#008060", fontWeight: "600" }}>
            Create an account
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      <View
        style={{
          padding: 16,
          backgroundColor: "#f9fafb",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700" }}>
          {customer.displayName}
        </Text>
        {customer.email && (
          <Text style={{ color: "#666", marginTop: 4 }}>{customer.email}</Text>
        )}
        {customer.phone && (
          <Text style={{ color: "#666", marginTop: 2 }}>{customer.phone}</Text>
        )}
      </View>

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
        Order history
      </Text>

      {ordersLoading ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : orders.length === 0 ? (
        <Text style={{ color: "#666", padding: 16 }}>
          You haven't placed any orders yet.
        </Text>
      ) : (
        orders.map((o) => (
          <View
            key={o.id}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: "600" }}>Order #{o.orderNumber}</Text>
              <Text style={{ fontSize: 14, fontWeight: "600" }}>
                {formatMoney(o.totalPrice)}
              </Text>
            </View>
            <Text style={{ color: "#666", fontSize: 12 }}>
              {new Date(o.processedAt).toLocaleDateString()}
              {o.financialStatus && `  •  ${o.financialStatus.toLowerCase()}`}
              {o.fulfillmentStatus && `  •  ${o.fulfillmentStatus.toLowerCase()}`}
            </Text>
            <Text style={{ color: "#666", fontSize: 12, marginTop: 6 }}>
              {o.lineItems
                .map((li) => `${li.quantity}× ${li.title}`)
                .join(", ")}
            </Text>
          </View>
        ))
      )}

      <Pressable
        onPress={logout}
        style={{
          marginTop: 24,
          padding: 14,
          borderWidth: 1,
          borderColor: "#dc2626",
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#dc2626", fontWeight: "600" }}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}
