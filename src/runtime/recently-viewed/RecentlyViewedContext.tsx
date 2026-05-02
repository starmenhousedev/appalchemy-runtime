import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// Tracks the most recently viewed product handles, deduped, most recent
// first, capped at MAX. Persists to AsyncStorage so it survives restarts.

const STORAGE_KEY = "@appalchemy/recently_viewed";
const MAX = 30;

interface RecentlyViewedContextValue {
  handles: string[];
  pushView: (handle: string) => Promise<void>;
  clear: () => Promise<void>;
}

const Context = createContext<RecentlyViewedContextValue | null>(null);

export function RecentlyViewedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [handles, setHandles] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setHandles(parsed.filter((h) => typeof h === "string").slice(0, MAX));
          }
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const pushView = useCallback(async (handle: string) => {
    setHandles((prev) => {
      const next = [handle, ...prev.filter((h) => h !== handle)].slice(0, MAX);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clear = useCallback(async () => {
    setHandles([]);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  return (
    <Context.Provider value={{ handles, pushView, clear }}>
      {children}
    </Context.Provider>
  );
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const ctx = useContext(Context);
  if (!ctx)
    throw new Error("useRecentlyViewed must be inside <RecentlyViewedProvider>");
  return ctx;
}
