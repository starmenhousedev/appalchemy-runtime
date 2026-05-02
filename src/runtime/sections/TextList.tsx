import React from "react";
import { Pressable, Text, View } from "react-native";
import type { Section } from "../types";

type TextListSection = Extract<Section, { type: "text_list" }>;

export function TextList({ section }: { section: TextListSection }) {
  return (
    <View style={{ padding: 16 }}>
      {section.title && (
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          {section.title}
        </Text>
      )}
      {section.config.items.map((item, i) => {
        const content = (
          <Text style={{ fontSize: 14, paddingVertical: 6, color: "#333" }}>
            • {item.text}
          </Text>
        );
        return item.link ? (
          <Pressable key={i} onPress={() => {}}>
            {content}
          </Pressable>
        ) : (
          <View key={i}>{content}</View>
        );
      })}
    </View>
  );
}
