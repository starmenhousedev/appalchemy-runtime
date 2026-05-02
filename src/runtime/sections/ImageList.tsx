import React from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";
import type { Section } from "../types";

type ImageListSection = Extract<Section, { type: "image_list" }>;

export function ImageList({ section }: { section: ImageListSection }) {
  const { width } = useWindowDimensions();
  const padding = 16;
  const gap = 8;
  const cols = section.config.columns;
  const tileWidth = (width - 2 * padding - gap * (cols - 1)) / cols;

  return (
    <View style={{ padding }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
        {section.config.images.map((img, i) => (
          <View key={i} style={{ width: tileWidth }}>
            <Image
              source={{ uri: img.url }}
              style={{
                width: tileWidth,
                height: tileWidth,
                borderRadius: 8,
                backgroundColor: "#f0f0f0",
              }}
              resizeMode="cover"
            />
            {section.config.showCaption && img.alt && (
              <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {img.alt}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
