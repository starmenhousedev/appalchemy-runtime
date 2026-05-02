import React from "react";
import { Text, View } from "react-native";
import type { Section } from "../types";

type RichTextSection = Extract<Section, { type: "rich_text" }>;

// V0: render content as plain text. A future iteration plugs in
// react-native-markdown-display or react-native-render-html depending on
// the merchant-selected format. Both libraries cost RN bundle size, so
// they're deferred until the schema's `format` is actually being used.
export function RichText({ section }: { section: RichTextSection }) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 14, lineHeight: 22, color: "#333" }}>
        {section.config.content}
      </Text>
    </View>
  );
}
