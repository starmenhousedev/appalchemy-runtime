import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { Section } from "../types";

type AnnouncementsSection = Extract<Section, { type: "announcements" }>;

export function Announcements({ section }: { section: AnnouncementsSection }) {
  const [index, setIndex] = useState(0);
  const messages = section.config.messages;

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, section.config.rotationIntervalMs);
    return () => clearInterval(id);
  }, [messages.length, section.config.rotationIntervalMs]);

  if (messages.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: "#008060",
        paddingVertical: 8,
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 13,
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        {messages[index]}
      </Text>
    </View>
  );
}
