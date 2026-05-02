// Build-time configuration baked into the merchant's app binary.
//
// In the build pipeline, these values are injected per-merchant:
//   SHOP_DOMAIN    = e.g. "starmendev.myshopify.com"
//   API_BASE       = e.g. "https://app.analytics.deodap.in/api/runtime"
//   STOREFRONT_TOKEN = the merchant's Shopify Storefront API access token
//   APP_NAME       = display name shown in pushes / nav
//
// For local dev / first scaffolding, these are placeholders.

export const RUNTIME_CONFIG = {
  shopDomain: process.env.EXPO_PUBLIC_SHOP_DOMAIN ?? "starmendev.myshopify.com",
  apiBase:
    process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:3000/api/runtime",
  storefrontToken: process.env.EXPO_PUBLIC_STOREFRONT_TOKEN ?? "",
  appName: process.env.EXPO_PUBLIC_APP_NAME ?? "AppAlchemy Demo",
};
