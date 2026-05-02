import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useCallback } from "react";
import { useTheme } from "../ThemeContext";
import type { StackParamList } from "./types";
import type { Section } from "../types";

type LinkTarget = NonNullable<
  Extract<Section, { type: "menu" }>["config"]["items"][number]["link"]
>;

// Convert a `LinkTarget` from the theme JSON into a navigation action on the
// current tab's stack. Pages are looked up by slug → page id since the JSON
// schema only carries slugs (page ids are runtime-only).
export function useNavigateToLink() {
  const navigation = useNavigation<StackNavigationProp<StackParamList>>();
  const { theme } = useTheme();

  return useCallback(
    (link: LinkTarget | undefined) => {
      if (!link || link.kind === "none") return;
      switch (link.kind) {
        case "page": {
          const page = theme?.pages.find((p) => p.slug === link.pageSlug);
          if (page) navigation.navigate("Page", { pageId: page.id });
          return;
        }
        case "product":
          navigation.navigate("ProductDetail", { handle: link.productHandle });
          return;
        case "collection": {
          // The theme can override the default Collection page via slug; fall
          // back to the page typed "collection".
          const page = theme?.pages.find((p) => p.type === "collection");
          if (page) navigation.navigate("Page", { pageId: page.id });
          return;
        }
        case "url":
          navigation.navigate("WebView", { url: link.url });
          return;
      }
    },
    [navigation, theme],
  );
}
