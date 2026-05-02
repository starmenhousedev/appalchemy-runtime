import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Platform } from "react-native";
import { RUNTIME_CONFIG } from "../config";

// Lazy-loaded Firebase Messaging module. Per-merchant builds install
// `@react-native-firebase/messaging` + native config files
// (google-services.json / GoogleService-Info.plist). Until the pipeline
// is wired, this module isn't present locally — we degrade gracefully
// instead of crashing. Types stay loose since the dep is optional.
type MessagingInstance = {
  requestPermission: () => Promise<number>;
  getToken: () => Promise<string>;
  onMessage: (cb: (msg: RemoteMessage) => void) => () => void;
  onNotificationOpenedApp: (cb: (msg: RemoteMessage) => void) => () => void;
  getInitialNotification: () => Promise<RemoteMessage | null>;
};

type RemoteMessage = {
  notification?: { title?: string; body?: string };
  data?: Record<string, string | undefined>;
};

let _messaging: MessagingInstance | null = null;

function getMessaging(): MessagingInstance | null {
  if (_messaging) return _messaging;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@react-native-firebase/messaging");
    const factory = mod?.default ?? mod;
    _messaging = typeof factory === "function" ? factory() : factory;
    return _messaging;
  } catch {
    return null;
  }
}

const TOKEN_CACHE_KEY = "@appalchemy/push_token";

/**
 * Request notification permission, fetch the FCM token, and POST it to the
 * AppAlchemy server so the push worker knows how to reach this device.
 * Idempotent and silently no-ops if Firebase isn't linked yet.
 */
export async function registerForPush(): Promise<string | null> {
  const messaging = getMessaging();
  if (!messaging) return null;

  try {
    if (Platform.OS === "ios") {
      const status = await messaging.requestPermission();
      // 1 = AUTHORIZED, 2 = PROVISIONAL, 0 = DENIED
      if (status !== 1 && status !== 2) return null;
    }
    const token = await messaging.getToken();
    if (!token) return null;

    const cached = await AsyncStorage.getItem(TOKEN_CACHE_KEY);
    if (cached === token) return token; // already registered, skip POST

    const res = await fetch(`${RUNTIME_CONFIG.apiBase}/push/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop: RUNTIME_CONFIG.shopDomain,
        token,
        platform: Platform.OS,
      }),
    });
    if (res.ok) {
      await AsyncStorage.setItem(TOKEN_CACHE_KEY, token);
    }
    return token;
  } catch (e) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn("Push registration failed:", e);
    }
    return null;
  }
}

type NotificationTapHandler = (data: Record<string, string | undefined>) => void;

/**
 * Wire foreground + background + cold-start notification handlers. Returns
 * an unsubscribe function. The merchant's build provides Firebase; if not
 * present, returns a no-op cleanup.
 */
export function attachPushHandlers(onTap: NotificationTapHandler): () => void {
  const messaging = getMessaging();
  if (!messaging) return () => {};

  // Foreground messages — shown manually by the OS isn't automatic in iOS.
  // For now, just log; later we can plug `notifee` for in-app banners.
  const offForeground = messaging.onMessage(async (_msg: RemoteMessage) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("Push (foreground):", _msg);
    }
  });

  // User tapped a notification while app was backgrounded.
  const offTapped = messaging.onNotificationOpenedApp((msg: RemoteMessage) => {
    if (msg?.data) onTap(msg.data);
  });

  // Cold start from a notification tap.
  messaging
    .getInitialNotification()
    .then((msg: RemoteMessage | null) => {
      if (msg?.data) onTap(msg.data);
    })
    .catch(() => {});

  return () => {
    offForeground();
    offTapped();
  };
}

/**
 * If the notification payload contains a `link` field, hand it to the OS
 * Linking layer so React Navigation's `linking` config picks it up.
 */
export function defaultNotificationTap(
  data: Record<string, string | undefined>,
): void {
  const link = data.link;
  if (link) Linking.openURL(link).catch(() => {});
}
