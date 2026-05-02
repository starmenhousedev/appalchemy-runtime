import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import type { Section } from "../types";

type CountdownTimerSection = Extract<Section, { type: "countdown_timer" }>;

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function compute(targetIso: string): TimeLeft {
  const targetMs = new Date(targetIso).getTime();
  const diff = targetMs - Date.now();
  if (Number.isNaN(targetMs) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, expired: false };
}

export function CountdownTimer({ section }: { section: CountdownTimerSection }) {
  const [left, setLeft] = useState<TimeLeft>(() => compute(section.config.targetAt));

  useEffect(() => {
    const id = setInterval(() => setLeft(compute(section.config.targetAt)), 1000);
    return () => clearInterval(id);
  }, [section.config.targetAt]);

  return (
    <View
      style={{
        margin: 16,
        padding: 16,
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {section.config.title}
      </Text>
      {left.expired ? (
        <Text style={{ color: "#ddd", fontSize: 13 }}>
          {section.config.expiredMessage}
        </Text>
      ) : (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Box label="DAYS" value={left.days} />
          <Box label="HRS" value={left.hours} />
          <Box label="MIN" value={left.minutes} />
          <Box label="SEC" value={left.seconds} />
        </View>
      )}
    </View>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>
        {String(value).padStart(2, "0")}
      </Text>
      <Text style={{ color: "#aaa", fontSize: 10, letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );
}
