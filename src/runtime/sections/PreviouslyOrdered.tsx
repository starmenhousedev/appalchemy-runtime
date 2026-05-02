import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { Section } from "../types";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../shopify/useProducts";
import { useCustomer } from "../customer/CustomerContext";
import { storefrontQuery } from "../shopify/client";
import { CUSTOMER_ORDERS_QUERY } from "../customer/queries";
import type { StackParamList } from "../navigation/types";

type PreviouslyOrderedSection = Extract<
  Section,
  { type: "previously_ordered" }
>;

interface RawOrder {
  lineItems: {
    nodes: { variant: { product: { handle: string } } | null }[];
  };
}

export function PreviouslyOrdered({
  section,
}: {
  section: PreviouslyOrderedSection;
}) {
  const { width } = useWindowDimensions();
  const padding = 16;
  const gap = 8;
  const cols = section.config.columns;
  const tileWidth = (width - 2 * padding - gap * (cols - 1)) / cols;
  const max = section.config.maxItems;

  const { accessToken, customer } = useCustomer();
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const [handles, setHandles] = useState<string[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<Error | null>(null);

  // Pull purchased product handles from the most recent 25 orders.
  // Dedupes preserving most-recent-first order.
  useEffect(() => {
    if (!accessToken) {
      setHandles([]);
      return;
    }
    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError(null);
    storefrontQuery<{ customer: { orders: { nodes: RawOrder[] } } | null }>(
      CUSTOMER_ORDERS_QUERY,
      { accessToken, first: 25 },
    )
      .then((data) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const result: string[] = [];
        for (const o of data.customer?.orders.nodes ?? []) {
          for (const li of o.lineItems.nodes) {
            const h = li.variant?.product.handle;
            if (h && !seen.has(h)) {
              seen.add(h);
              result.push(h);
              if (result.length >= max) break;
            }
          }
          if (result.length >= max) break;
        }
        setHandles(result);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setOrdersError(e instanceof Error ? e : new Error(String(e)));
        }
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, max]);

  // Logged-out: show CTA.
  if (!customer) {
    return (
      <View style={{ padding }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          {section.config.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
          Log in to see what you've ordered before.
        </Text>
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={{
            alignSelf: "flex-start",
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: "#008060",
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>
            Log in
          </Text>
        </Pressable>
      </View>
    );
  }

  // Logged-in but no past orders.
  if (!ordersLoading && handles.length === 0) {
    return (
      <View style={{ padding }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          {section.config.title}
        </Text>
        <Text style={{ fontSize: 12, color: "#666" }}>
          You haven't ordered anything yet.
        </Text>
      </View>
    );
  }

  // Logged-in with handles → fetch actual products.
  return (
    <View style={{ padding }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
        {section.config.title}
      </Text>
      {ordersLoading ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : ordersError ? (
        <Text style={{ fontSize: 12, color: "#b00" }}>
          Couldn't load orders: {ordersError.message}
        </Text>
      ) : (
        <PreviouslyOrderedTiles
          handles={handles}
          max={max}
          tileWidth={tileWidth}
          gap={gap}
        />
      )}
    </View>
  );
}

function PreviouslyOrderedTiles({
  handles,
  max,
  tileWidth,
  gap,
}: {
  handles: string[];
  max: number;
  tileWidth: number;
  gap: number;
}) {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const { products, loading, error } = useProducts(
    { kind: "manual", productHandles: handles },
    max,
    "default",
  );

  if (loading && products.length === 0) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return (
      <Text style={{ fontSize: 12, color: "#b00" }}>
        Couldn't load products: {error.message}
      </Text>
    );
  }
  return (
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
  );
}
