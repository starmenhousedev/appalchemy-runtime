import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Section } from "../types";
import { useNavigateToLink } from "../navigation/useNavigateToLink";

type MenuSection = Extract<Section, { type: "menu" }>;

export function Menu({ section }: { section: MenuSection }) {
  const navigate = useNavigateToLink();
  return (
    <View style={{ paddingVertical: 8 }}>
      {section.config.items.map((item, i) => (
        <Pressable
          key={i}
          onPress={() => navigate(item.link)}
          style={({ pressed }) => ({
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: pressed ? "#f4f4f4" : "transparent",
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            flexDirection: "row",
            alignItems: "center",
          })}
        >
          {item.icon && (
            <Text style={{ fontSize: 18, marginRight: 12, width: 24 }}>
              {item.icon}
            </Text>
          )}
          <Text style={{ fontSize: 14, flex: 1 }}>{item.label}</Text>
          <Text style={{ color: "#999", fontSize: 16 }}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}
