import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import type { Section } from "../types";
import { useNavigateToLink } from "../navigation/useNavigateToLink";

type CarouselSection = Extract<Section, { type: "carousel" }>;

export function Carousel({ section }: { section: CarouselSection }) {
  const { width } = useWindowDimensions();
  const flatList = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const slides = section.config.slides;
  const navigate = useNavigateToLink();

  useEffect(() => {
    if (!section.config.autoplay || slides.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % slides.length;
        flatList.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, section.config.intervalMs);
    return () => clearInterval(t);
  }, [section.config.autoplay, section.config.intervalMs, slides.length]);

  function onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  if (slides.length === 0) return null;

  return (
    <View>
      <FlatList
        ref={flatList}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigate(item.link)}
            disabled={!item.link || item.link.kind === "none"}
          >
            <Image
              source={{ uri: item.url }}
              style={{ width, aspectRatio: 16 / 9, backgroundColor: "#f0f0f0" }}
              accessibilityLabel={item.alt}
              resizeMode="cover"
            />
          </Pressable>
        )}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
      {section.config.showIndicators && slides.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === index ? "#008060" : "#ccc",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
