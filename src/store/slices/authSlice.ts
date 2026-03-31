import { StateCreator } from 'zustand';
import { storage } from '../../utils/storage';
import { authApi } from '../../api';
import type { Shop } from '../../types';

export interface AuthSlice {
  token: string | null;
  shop: Shop | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (token: string, shopDomain?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  hydrateFromStorage: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  token: null,
  shop: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (token: string, shopDomain?: string) => {
    await storage.setToken(token);
    if (shopDomain) {
      await storage.setShopDomain(shopDomain);
    }
    set({ token, isAuthenticated: true, error: null });
    try {
      const session = await authApi.getSession();
      set({ shop: session.shop });
    } catch {
      // Session fetch failed but we're still authenticated
    }
  },

  logout: async () => {
    await storage.clearAll();
    set({
      token: null,
      shop: null,
      isAuthenticated: false,
      error: null,
    });
  },

  loadSession: async () => {
    try {
      const session = await authApi.getSession();
      set({ shop: session.shop, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load session';
      set({ error: message });
    }
  },

  hydrateFromStorage: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.getToken();
      if (token) {
        set({ token, isAuthenticated: true });
        try {
          const session = await authApi.getSession();
          set({ shop: session.shop });
        } catch {
          // Token might be expired, will be handled by interceptor
          await get().logout();
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },
});
