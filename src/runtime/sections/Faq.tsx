import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { Section } from "../types";

type FaqSection = Extract<Section, { type: "faq" }>;

export function Faq({ section }: { section: FaqSection }) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
        {section.title}
      </Text>
      {section.config.items.map((item, i) => (
        <FaqItem key={i} question={item.question} answer={item.answer} />
      ))}
    </View>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingVertical: 12,
      }}
    >
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 18, color: "#666", width: 14 }}>
            {open ? "−" : "+"}
          </Text>
          <Text style={{ fontWeight: "600", fontSize: 14, flex: 1 }}>
            {question}
          </Text>
        </View>
      </Pressable>
      {open && (
        <Text
          style={{
            marginTop: 8,
            paddingLeft: 24,
            color: "#444",
            fontSize: 13,
            lineHeight: 20,
          }}
        >
          {answer}
        </Text>
      )}
    </View>
  );
}
