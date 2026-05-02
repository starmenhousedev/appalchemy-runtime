// Map the icon string from theme.bottomBar (e.g. "home", "cart") to a
// rendered glyph. Using emoji avoids a vector-icon font dependency for v0;
// switch to react-native-vector-icons later for a more polished look.

export const TAB_ICONS: Record<string, string> = {
  home: "🏠",
  search: "🔍",
  cart: "🛒",
  account: "👤",
  wishlist: "❤️",
  categories: "🗂️",
  reels: "🎥",
  menu: "☰",
};

export function iconFor(key: string): string {
  return TAB_ICONS[key] ?? "•";
}
