import React from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";
import type { Section } from "../types";

type VideoBannerSection = Extract<Section, { type: "video_banner" }>;

const ASPECT_RATIOS: Record<string, number> = {
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "1:1": 1,
  "9:16": 9 / 16,
};

// Real video playback needs `expo-av` or `react-native-video`. Until that
// dep is wired, render the poster image (or a stub) at the configured
// aspect ratio so the layout is correct.
export function VideoBanner({ section }: { section: VideoBannerSection }) {
  const { width } = useWindowDimensions();
  const ratio = ASPECT_RATIOS[section.config.aspectRatio] ?? 16 / 9;
  const height = width / ratio;
  const poster = section.config.video.poster;

  return (
    <View style={{ width, height, backgroundColor: "#000" }}>
      {poster ? (
        <Image
          source={{ uri: poster }}
          style={{ width, height }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#fff", opacity: 0.6 }}>▶ Video</Text>
        </View>
      )}
    </View>
  );
}
