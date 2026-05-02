import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, View } from "react-native";
import type { Section } from "../types";

type ImageMarqueeSection = Extract<Section, { type: "image_marquee" }>;

const SPEEDS: Record<string, number> = {
  slow: 30000,
  normal: 15000,
  fast: 8000,
};

const ITEM_WIDTH = 120;
const ITEM_HEIGHT = 80;
const ITEM_GAP = 12;

// Auto-scrolling horizontal strip. Duplicates the image list once so the
// translation can loop seamlessly.
export function ImageMarquee({ section }: { section: ImageMarqueeSection }) {
  const translate = useRef(new Animated.Value(0)).current;
  const images = section.config.images;
  const totalWidth = images.length * (ITEM_WIDTH + ITEM_GAP);
  const duration = SPEEDS[section.config.speed] ?? SPEEDS.normal;
  const direction = section.config.direction;

  useEffect(() => {
    if (images.length === 0) return;
    const start = direction === "left" ? 0 : -totalWidth;
    const end = direction === "left" ? -totalWidth : 0;
    translate.setValue(start);
    const loop = Animated.loop(
      Animated.timing(translate, {
        toValue: end,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [direction, duration, images.length, totalWidth, translate]);

  if (images.length === 0) return null;

  return (
    <View style={{ overflow: "hidden", paddingVertical: 12 }}>
      <Animated.View
        style={{
          flexDirection: "row",
          gap: ITEM_GAP,
          transform: [{ translateX: translate }],
        }}
      >
        {[...images, ...images].map((img, i) => (
          <Image
            key={i}
            source={{ uri: img.url }}
            style={{
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
              borderRadius: 6,
              backgroundColor: "#f0f0f0",
            }}
            resizeMode="cover"
          />
        ))}
      </Animated.View>
    </View>
  );
}
