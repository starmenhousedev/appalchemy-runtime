import React, { useLayoutEffect } from "react";
import type { RouteProp } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "../ThemeContext";
import { PageRenderer } from "../PageRenderer";
import { CartScreen } from "./CartScreen";
import { AccountScreen } from "./AccountScreen";
import type { StackParamList } from "./types";

// Generic page screen. Looks up the page by id in the active theme and
// dispatches by page.type:
//   - cart → CartScreen (Storefront cart UI)
//   - web_view → WebView pointed at page.settings.url
//   - everything else → PageRenderer (sections from JSON)
export function PageScreen() {
  const route = useRoute<RouteProp<StackParamList, "Page">>();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const page = theme?.pages.find((p) => p.id === route.params.pageId);

  // Drive the stack header title from the resolved page. Done here (not in
  // Stack.Screen options) so we can safely read theme via useTheme.
  useLayoutEffect(() => {
    navigation.setOptions({ title: page?.title ?? "" });
  }, [navigation, page?.title]);
  if (!page) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Page not found.</Text>
      </View>
    );
  }

  if (page.type === "cart") {
    return <CartScreen />;
  }

  if (page.type === "account") {
    return <AccountScreen />;
  }

  if (page.type === "web_view") {
    const settings = (page.settings ?? {}) as { url?: string };
    if (!settings.url) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Web view URL not configured for this page.</Text>
        </View>
      );
    }
    return <WebView source={{ uri: settings.url }} style={{ flex: 1 }} />;
  }

  return <PageRenderer page={page} />;
}
