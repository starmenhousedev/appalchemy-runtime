import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { RUNTIME_CONFIG } from "./config";
import { CartProvider } from "./shopify/CartContext";
import { RuntimeNavigator } from "./navigation/RuntimeNavigator";
import { PushProvider } from "./push/PushProvider";
import { AnalyticsProvider } from "./analytics/AnalyticsProvider";
import { WishlistProvider } from "./wishlist/WishlistContext";
import { RecentlyViewedProvider } from "./recently-viewed/RecentlyViewedContext";
import { CustomerProvider } from "./customer/CustomerContext";

// Runtime entry. Loads the merchant's theme on launch, falls back to the
// cached version while refreshing in the background, and hands off to the
// navigator (bottom tab bar + per-tab stacks).

export function RuntimeApp() {
  return (
    <SafeAreaProvider>
      <AnalyticsProvider>
        <PushProvider>
          <ThemeProvider>
            <CustomerProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <CartProvider>
                    <Body />
                  </CartProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CustomerProvider>
          </ThemeProvider>
        </PushProvider>
      </AnalyticsProvider>
    </SafeAreaProvider>
  );
}

function Body() {
  const { theme, loading, error } = useTheme();

  if (loading && !theme) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading {RUNTIME_CONFIG.appName}…</Text>
      </View>
    );
  }

  if (error && !theme) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn't load theme</Text>
        <Text style={styles.muted}>{error.message}</Text>
        <Text style={[styles.muted, { marginTop: 12 }]}>
          Check that the app server is reachable at:
        </Text>
        <Text style={styles.code}>{RUNTIME_CONFIG.apiBase}</Text>
      </View>
    );
  }

  if (!theme) {
    return (
      <View style={styles.center}>
        <Text>No theme available.</Text>
      </View>
    );
  }

  return <RuntimeNavigator />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  muted: { color: "#666", marginTop: 8, textAlign: "center" },
  errorTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  code: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#444",
    marginTop: 4,
  },
});
