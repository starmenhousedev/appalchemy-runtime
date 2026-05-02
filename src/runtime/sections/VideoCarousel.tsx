import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import type { Section } from "../types";

type VideoCarouselSection = Extract<Section, { type: "video_carousel" }>;

// Step 3 renders posters as a paging list. Real video playback (autoplay,
// scrubbing) needs `expo-av` or `react-native-video`; deferred along with
// VideoBanner.
export function VideoCarousel({ section }: { section: VideoCarouselSection }) {
  const { width } = useWindowDimensions();
  const flatList = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const videos = section.config.videos;

  useEffect(() => {
    if (!section.config.autoplay || videos.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % videos.length;
        flatList.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, section.config.intervalMs);
    return () => clearInterval(t);
  }, [section.config.autoplay, section.config.intervalMs, videos.length]);

  function onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  if (videos.length === 0) return null;

  return (
    <FlatList
      ref={flatList}
      data={videos}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, i) => String(i)}
      getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
      renderItem={({ item }) =>
        item.poster ? (
          <Image
            source={{ uri: item.poster }}
            style={{ width, aspectRatio: 9 / 16, backgroundColor: "#000" }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width,
              aspectRatio: 9 / 16,
              backgroundColor: "#222",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", opacity: 0.6 }}>▶</Text>
          </View>
        )
      }
      onMomentumScrollEnd={onMomentumScrollEnd}
    />
  );
}
