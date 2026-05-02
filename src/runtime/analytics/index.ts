import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { RUNTIME_CONFIG } from "../config";

// Buffered analytics. Events are added to an in-memory queue; flushed
// periodically (every FLUSH_INTERVAL_MS) and on app background. Unsent
// events on crash/close are persisted to AsyncStorage and replayed on next
// launch so we don't lose data on flaky connections.

export interface AnalyticsEvent {
  event_type: string;
  shop: string;
  platform: string;
  occurred_at: string;
  session_id: string;
  metadata?: Record<string, unknown>;
}

const FLUSH_INTERVAL_MS = 15_000;
const STORAGE_KEY = "@appalchemy/pending_events";
const MAX_BATCH = 50;

let queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let sessionId = "";
let starting: Promise<void> | null = null;

function uuid() {
  // Lightweight ID, doesn't need cryptographic strength.
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function loadPending(): Promise<AnalyticsEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

async function persistPending(events: AnalyticsEvent[]): Promise<void> {
  try {
    if (events.length === 0) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  } catch {
    /* swallow */
  }
}

export async function startAnalytics(): Promise<void> {
  if (starting) return starting;
  starting = (async () => {
    sessionId = uuid();
    queue = await loadPending();

    flushTimer = setInterval(() => {
      flush().catch(() => {});
    }, FLUSH_INTERVAL_MS);

    track("session_start");
  })();
  return starting;
}

export function stopAnalytics(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

export function track(
  eventType: string,
  metadata?: Record<string, unknown>,
): void {
  if (!sessionId) sessionId = uuid();
  queue.push({
    event_type: eventType,
    shop: RUNTIME_CONFIG.shopDomain,
    platform: Platform.OS,
    occurred_at: new Date().toISOString(),
    session_id: sessionId,
    metadata,
  });
}

export async function flush(): Promise<void> {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH);
  // Persist immediately so a crash mid-flight doesn't lose them; remove
  // from storage on success.
  await persistPending([...queue, ...batch]);
  try {
    const res = await fetch(`${RUNTIME_CONFIG.apiBase}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
    });
    if (!res.ok) {
      // Server rejected — put back at the front and retry on next flush.
      queue.unshift(...batch);
      await persistPending(queue);
      return;
    }
    // Success — strip them from persisted queue.
    await persistPending(queue);
  } catch {
    queue.unshift(...batch);
    await persistPending(queue);
  }
}
