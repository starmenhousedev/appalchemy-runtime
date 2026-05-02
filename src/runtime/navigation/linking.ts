import type { LinkingOptions, ParamListBase } from "@react-navigation/native";
import { RUNTIME_CONFIG } from "../config";

// Deep-link configuration for React Navigation.
//
//   appalchemy://product/<handle>            → ProductDetail
//   appalchemy://page/<id>                   → Page (in the first tab)
//   appalchemy://web?url=<encoded>           → WebView
//
// Plus universal-link fallback: https://<shop_domain>/products/<handle>
// resolves to the product detail screen if the OS associates the app with
// the merchant's domain (configured per-merchant via Apple's
// apple-app-site-association + Android's assetlinks.json).
//
// At build time, the appalchemy:// scheme should be replaced with a
// per-merchant scheme like sarahsboutique:// to avoid collisions across
// installed AppAlchemy-built apps.
//
// Tab names are positional (`tab_0`, `tab_1`, …) so a deep link routes to
// the first tab's stack — sufficient for single-screen navigation within
// the home tab. More sophisticated routing (e.g. opening a product inside
// the Categories tab) is a future pass.

// React Navigation's `LinkingOptions` PathConfig gets fussy about nested
// screens when the navigator types are untyped. The cast is fine because
// this config is runtime-only (Navigation parses it at runtime, not at
// compile time) and a typo here would surface as a runtime no-match.
export const linking: LinkingOptions<ParamListBase> = {
  prefixes: ["appalchemy://", `https://${RUNTIME_CONFIG.shopDomain}`],
  config: {
    screens: {
      tab_0: {
        screens: {
          ProductDetail: { path: "product/:handle" },
          Page: {
            path: "page/:pageId",
            parse: { pageId: (v: string) => Number(v) },
          },
          WebView: {
            path: "web",
            parse: { url: (v: string) => decodeURIComponent(v) },
          },
        },
      },
    },
  } as LinkingOptions<ParamListBase>["config"],
};
