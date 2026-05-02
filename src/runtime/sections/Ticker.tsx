import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, useWindowDimensions, View } from "react-native";
import type { Section } from "../types";

type TickerSection = Extract<Section, { type: "ticker" }>;

const SPEEDS: Record<string, number> = {
  slow: 30000,
  normal: 18000,
  fast: 10000,
};

// Single-line auto-scrolling text. Same loop trick as ImageMarquee.
export function Ticker({ section }: { section: TickerSection }) {
  const { width } = useWindowDimensions();
  const translate = useRef(new Animated.Value(0)).current;
  const duration = SPEEDS[section.config.speed] ?? SPEEDS.normal;
  const direction = section.config.direction;

  useEffect(() => {
    const start = direction === "left" ? width : -width;
    const end = direction === "left" ? -width : width;
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
  }, [direction, duration, translate, width]);

  return (
    <View
      style={{
        backgroundColor: "#fff5e6",
        paddingVertical: 6,
        overflow: "hidden",
      }}
    >
      <Animated.View style={{ transform: [{ translateX: translate }] }}>
        <Text style={{ fontSize: 13, color: "#a35200", fontWeight: "500" }}>
          {section.config.message}
        </Text>
      </Animated.View>
    </View>
  );
}
