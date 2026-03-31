import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

export const storage = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async getShopDomain(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.SHOP_DOMAIN);
  },

  async setShopDomain(domain: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SHOP_DOMAIN, domain);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.SHOP_DOMAIN),
      AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_DEVICE),
    ]);
  },
};
