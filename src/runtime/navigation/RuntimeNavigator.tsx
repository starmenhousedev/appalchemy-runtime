import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import {
  createStackNavigator,
  type StackNavigationOptions,
} from "@react-navigation/stack";
import { useTheme } from "../ThemeContext";
import { useCart } from "../shopify/CartContext";
import { PageScreen } from "./PageScreen";
import { ProductDetailScreen } from "./ProductDetailScreen";
import { WebViewScreen } from "./WebViewScreen";
import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";
import { iconFor } from "./icons";
import { linking } from "./linking";
import type { StackParamList } from "./types";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<StackParamList>();

const stackOptions: StackNavigationOptions = {
  headerStyle: { backgroundColor: "#fff" },
  headerTitleStyle: { fontWeight: "600", fontSize: 16 },
  headerTintColor: "#111",
};

// Each tab in the bottom bar gets its own stack so deep navigation in
// (e.g.) the Home tab doesn't pop the user out of that tab.
function TabStack({ initialPageId }: { initialPageId: number }) {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen
        name="Page"
        component={PageScreen}
        initialParams={{ pageId: initialPageId }}
        options={({ route }) => {
          const pageId = (route.params as { pageId?: number } | undefined)?.pageId;
          return { title: usePageTitle(pageId) };
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Product" }}
      />
      <Stack.Screen
        name="WebView"
        component={WebViewScreen}
        options={({ route }) => ({ title: route.params.title ?? "" })}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Log in" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Create account" }}
      />
    </Stack.Navigator>
  );
}

// Read page title from theme. Has to be a hook so it re-runs when theme refreshes.
function usePageTitle(pageId: number | undefined): string {
  const { theme } = useTheme();
  if (pageId === undefined || !theme) return "";
  return theme.pages.find((p) => p.id === pageId)?.title ?? "";
}

export function RuntimeNavigator() {
  const { theme } = useTheme();
  const { cart } = useCart();

  if (!theme) return null;

  const bar = theme.bottomBar.length > 0
    ? theme.bottomBar
    // Fallback: build a default bar from the first 4 visible pages so a
    // theme without bottom_bar config still navigates.
    : theme.pages
        .filter((p) => p.is_visible)
        .slice(0, 4)
        .map((p) => ({ page_id: p.id, label: p.title, icon: defaultIconFor(p.type) }));

  return (
    <NavigationContainer linking={linking}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#008060",
          tabBarInactiveTintColor: "#666",
          tabBarStyle: { borderTopColor: "#eee" },
        }}
      >
        {bar.map((item, i) => {
          const isCart = isCartPage(theme, item.page_id);
          const badgeCount = isCart ? cart?.totalQuantity ?? 0 : 0;

          const screenOpts: BottomTabNavigationOptions = {
            tabBarLabel: item.label,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.7 }}>
                {iconFor(item.icon)}
              </Text>
            ),
            tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
          };

          return (
            <Tab.Screen
              key={`${item.page_id}-${i}`}
              name={`tab_${i}`}
              options={screenOpts}
            >
              {() => <TabStack initialPageId={item.page_id} />}
            </Tab.Screen>
          );
        })}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function isCartPage(
  theme: ReturnType<typeof useTheme>["theme"],
  pageId: number,
): boolean {
  return theme?.pages.find((p) => p.id === pageId)?.type === "cart";
}

function defaultIconFor(pageType: string): string {
  switch (pageType) {
    case "home":
      return "home";
    case "collection":
    case "products":
    case "product_list":
      return "categories";
    case "cart":
      return "cart";
    case "account":
      return "account";
    case "reels":
      return "reels";
    default:
      return "menu";
  }
}

// Empty placeholder used when there's literally nothing to render.
export function EmptyTabs() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>No pages in theme.</Text>
    </View>
  );
}
