import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Video, { type VideoRef } from "react-native-video";
import type { Section } from "../types";
import { useNavigateToLink } from "../navigation/useNavigateToLink";

type VideoBannerSection = Extract<Section, { type: "video_banner" }>;

const ASPECT_RATIOS: Record<string, number> = {
  "16:9": 16 / 9,
  "4:3": 4 / 3,
  "1:1": 1,
  "9:16": 9 / 16,
};

export function VideoBanner({ section }: { section: VideoBannerSection }) {
  const { width } = useWindowDimensions();
  const ratio = ASPECT_RATIOS[section.config.aspectRatio] ?? 16 / 9;
  const height = width / ratio;
  const { video, autoplay, muted, loop } = section.config;
  const navigateToLink = useNavigateToLink();
  const [posterVisible, setPosterVisible] = useState(true);
  const [errored, setErrored] = useState(false);

  const ref = React.useRef<VideoRef>(null);

  const content = (
    <View style={[styles.container, { width, height }]}>
      {!errored && (
        <Video
          ref={ref}
          source={{ uri: video.url }}
          style={[StyleSheet.absoluteFill, { width, height }]}
          paused={!autoplay}
          muted={muted}
          repeat={loop}
          resizeMode="cover"
          controls={!autoplay}
          onReadyForDisplay={() => setPosterVisible(false)}
          onError={() => setErrored(true)}
          ignoreSilentSwitch="ignore"
          playInBackground={false}
        />
      )}
      {(posterVisible || errored) && video.poster && (
        <Image
          source={{ uri: video.poster }}
          style={[StyleSheet.absoluteFill, { width, height }]}
          resizeMode="cover"
        />
      )}
      {(posterVisible || errored) && !video.poster && (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Text style={styles.placeholderText}>▶ Video</Text>
        </View>
      )}
    </View>
  );

  const link = video.link;
  if (link && link.kind !== "none") {
    return (
      <Pressable onPress={() => navigateToLink(link)}>{content}</Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#000", overflow: "hidden" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#fff", opacity: 0.6 },
});
