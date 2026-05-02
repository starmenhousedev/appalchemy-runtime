import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import type { RuntimePage } from "./api";
import { renderSection } from "./sections";

interface Props {
  page: RuntimePage;
}

export function PageRenderer({ page }: Props) {
  const visibleSections = page.sections
    .filter((s) => s.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {visibleSections.map((section) => (
        <React.Fragment key={section.id}>{renderSection(section)}</React.Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 80,
  },
});
