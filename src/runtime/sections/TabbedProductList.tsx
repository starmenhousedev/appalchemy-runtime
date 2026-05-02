import React, { useState } from "react";
import {
  ActivityIndicator,
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

type TabbedProductListSection = Extract<
  Section,
  { type: "tabbed_product_list" }
>;

export function TabbedProductList({
  section,
}: {
  section: TabbedProductListSection;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const tabs = section.config.tabs;
  const max = section.config.maxPerTab;
  const sort = section.config.sort;

  if (tabs.length === 0) return null;
  const activeTab = tabs[activeIdx];

  return (
    <View style={{ paddingVertical: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {tabs.map((tab, i) => {
          const isActive = i === activeIdx;
          return (
            <Pressable
              key={i}
              onPress={() => setActiveIdx(i)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 16,
                backgroundColor: isActive ? "#008060" : "#f4f4f4",
              }}
            >
              <Text
                style={{
                  color: isActive ? "#fff" : "#333",
                  fontSize: 13,
                  fontWeight: isActive ? "600" : "400",
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <TabContent source={activeTab.source} max={max} sort={sort} />
    </View>
  );
}

function TabContent({
  source,
  max,
  sort,
}: {
  source: TabbedProductListSection["config"]["tabs"][number]["source"];
  max: number;
  sort: TabbedProductListSection["config"]["sort"];
}) {
  const { products, loading, error } = useProducts(source, max, sort);
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();

  if (loading && products.length === 0) {
    return (
      <View style={{ padding: 32, alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return (
      <Text style={{ padding: 16, fontSize: 12, color: "#b00" }}>
        Couldn't load products: {error.message}
      </Text>
    );
  }
  if (products.length === 0) {
    return (
      <Text style={{ padding: 16, fontSize: 12, color: "#666" }}>
        No products in this tab.
      </Text>
    );
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, gap: 10 }}
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
  );
}
