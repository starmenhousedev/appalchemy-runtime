import React from "react";
import { Image, useWindowDimensions, View } from "react-native";
import type { Section } from "../types";

type ImageCollageSection = Extract<Section, { type: "image_collage" }>;

export function ImageCollage({ section }: { section: ImageCollageSection }) {
  const { width } = useWindowDimensions();
  const padding = 16;
  const gap = 6;
  const innerWidth = width - 2 * padding;
  const layout = section.config.layout;
  const images = section.config.images;

  const imgStyle = (w: number, h: number) => ({
    width: w,
    height: h,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  });

  function tile(i: number, w: number, h: number) {
    const img = images[i];
    if (!img) return <View style={imgStyle(w, h)} />;
    return (
      <Image
        source={{ uri: img.url }}
        style={imgStyle(w, h)}
        resizeMode="cover"
      />
    );
  }

  if (layout === "grid_2x2") {
    const tileSize = (innerWidth - gap) / 2;
    return (
      <View style={{ padding }}>
        <View style={{ flexDirection: "row", gap }}>
          {tile(0, tileSize, tileSize)}
          {tile(1, tileSize, tileSize)}
        </View>
        <View style={{ flexDirection: "row", gap, marginTop: gap }}>
          {tile(2, tileSize, tileSize)}
          {tile(3, tileSize, tileSize)}
        </View>
      </View>
    );
  }

  if (layout === "hero_left" || layout === "hero_right") {
    const heroWidth = (innerWidth - gap) * 0.6;
    const sideWidth = innerWidth - heroWidth - gap;
    const sideHeight = (heroWidth - gap) / 2;
    const hero = tile(0, heroWidth, heroWidth);
    const side = (
      <View style={{ gap, width: sideWidth }}>
        {tile(1, sideWidth, sideHeight)}
        {tile(2, sideWidth, sideHeight)}
      </View>
    );
    return (
      <View style={{ padding }}>
        <View style={{ flexDirection: "row", gap }}>
          {layout === "hero_left" ? hero : side}
          {layout === "hero_left" ? side : hero}
        </View>
      </View>
    );
  }

  // three_stacked
  const h = innerWidth * 0.4;
  return (
    <View style={{ padding, gap }}>
      {tile(0, innerWidth, h)}
      {tile(1, innerWidth, h)}
      {tile(2, innerWidth, h)}
    </View>
  );
}
