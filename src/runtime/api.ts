import AsyncStorage from "@react-native-async-storage/async-storage";
import { RUNTIME_CONFIG } from "./config";
import type { Section } from "./types";

// Theme JSON shape returned by the AppAlchemy server. Mirrors the Prisma
// shape so a serialized ImportedTheme drops in directly.
export interface RuntimePage {
  id: number;
  title: string;
  slug: string;
  type: string;
  is_visible: boolean;
  sort_order: number;
  settings: unknown;
  sections: Section[];
}

export interface RuntimeBottomBarItem {
  page_id: number;
  label: string;
  icon: string;
}

export interface RuntimeTheme {
  id: number;
  name: string;
  pages: RuntimePage[];
  bottomBar: RuntimeBottomBarItem[];
  productSorting?: { order: string };
  productLabels?: unknown[];
  cartGoals?: unknown[];
}

const CACHE_KEY = "@appalchemy/theme";

export async function fetchTheme(): Promise<RuntimeTheme> {
  const url = `${RUNTIME_CONFIG.apiBase}/theme/${encodeURIComponent(RUNTIME_CONFIG.shopDomain)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Theme fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as RuntimeTheme;
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(json));
  return json;
}

export async function loadCachedTheme(): Promise<RuntimeTheme | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RuntimeTheme;
  } catch {
    return null;
  }
}

export async function clearCachedTheme(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
