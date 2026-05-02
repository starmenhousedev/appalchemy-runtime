import React from "react";
import { Image, Pressable, useWindowDimensions } from "react-native";
import type { Section } from "../types";
import { useNavigateToLink } from "../navigation/useNavigateToLink";

type BannerSection = Extract<Section, { type: "banner" }>;

const ASPECT_RATIOS: Record<string, number> = {
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "1:1": 1,
  "3:4": 3 / 4,
  "9:16": 9 / 16,
};

export function Banner({ section }: { section: BannerSection }) {
  const { width } = useWindowDimensions();
  const ratio = ASPECT_RATIOS[section.config.aspectRatio] ?? 16 / 9;
  const height = width / ratio;
  const navigate = useNavigateToLink();
  const link = section.config.image.link;

  return (
    <Pressable onPress={() => navigate(link)} disabled={!link || link.kind === "none"}>
      <Image
        source={{ uri: section.config.image.url }}
        style={{ width, height, backgroundColor: "#f0f0f0" }}
        accessibilityLabel={section.config.image.alt}
        resizeMode="cover"
      />
    </Pressable>
  );
}
