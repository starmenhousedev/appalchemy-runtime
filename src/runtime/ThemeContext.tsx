import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";
import { fetchTheme, loadCachedTheme, type RuntimeTheme } from "./api";

interface ThemeContextValue {
  theme: RuntimeTheme | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const Context = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<RuntimeTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const next = await fetchTheme();
      setTheme(next);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  // First mount: show cached immediately, then refresh in background.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await loadCachedTheme();
      if (!cancelled && cached) {
        setTheme(cached);
        setLoading(false);
      }
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  // Refresh on app foreground so design changes propagate without restart.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return (
    <Context.Provider value={{ theme, loading, error, refresh }}>
      {children}
    </Context.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useTheme must be called inside <ThemeProvider>");
  }
  return ctx;
}
