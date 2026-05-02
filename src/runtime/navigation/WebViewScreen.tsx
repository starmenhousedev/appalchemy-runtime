import React from "react";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import type { StackParamList } from "./types";

export function WebViewScreen() {
  const { params } = useRoute<RouteProp<StackParamList, "WebView">>();
  return <WebView source={{ uri: params.url }} style={{ flex: 1 }} />;
}
