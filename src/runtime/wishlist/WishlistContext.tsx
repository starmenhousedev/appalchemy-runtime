import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Local-only wishlist of product handles. Persists to AsyncStorage so it
// survives app restarts. When customer auth is wired (Stage 12), the
// wishlist gets synced to the Storefront customer record so it follows
// the customer across devices.

const STORAGE_KEY = "@appalchemy/wishlist";

interface WishlistContextValue {
  handles: string[];
  isWishlisted: (handle: string) => boolean;
  add: (handle: string) => Promise<void>;
  remove: (handle: string) => Promise<void>;
  toggle: (handle: string) => Promise<boolean>; // returns new state
  clear: () => Promise<void>;
}

const Context = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [handles, setHandles] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setHandles(parsed.filter((h) => typeof h === "string"));
        } catch {
          /* ignore corrupt cache */
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: string[]) => {
    setHandles(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const value = useMemo<WishlistContextValue>(() => {
    const set = new Set(handles);
    return {
      handles,
      isWishlisted: (h) => set.has(h),
      add: async (h) => {
        if (set.has(h)) return;
        await persist([...handles, h]);
      },
      remove: async (h) => {
        if (!set.has(h)) return;
        await persist(handles.filter((x) => x !== h));
      },
      toggle: async (h) => {
        if (set.has(h)) {
          await persist(handles.filter((x) => x !== h));
          return false;
        }
        await persist([...handles, h]);
        return true;
      },
      clear: async () => {
        await persist([]);
      },
    };
  }, [handles, persist]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useWishlist must be inside <WishlistProvider>");
  return ctx;
}
