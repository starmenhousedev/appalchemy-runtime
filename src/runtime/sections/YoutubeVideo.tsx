import React from "react";
import { useWindowDimensions, View } from "react-native";
import { WebView } from "react-native-webview";
import type { Section } from "../types";

type YoutubeVideoSection = Extract<Section, { type: "youtube_video" }>;

export function YoutubeVideo({ section }: { section: YoutubeVideoSection }) {
  const { width } = useWindowDimensions();
  const height = (width * 9) / 16;
  const { videoId, autoplay, controls } = section.config;
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    controls: controls ? "1" : "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
  });
  const uri = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;

  return (
    <View style={{ width, height, backgroundColor: "#000" }}>
      <WebView
        source={{ uri }}
        style={{ width, height }}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}
