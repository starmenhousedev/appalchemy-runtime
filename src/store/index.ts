import { create } from 'zustand';
import { createAuthSlice, AuthSlice } from './slices/authSlice';
import { createThemeSlice, ThemeSlice } from './slices/themeSlice';
import { createUiSlice, UiSlice } from './slices/uiSlice';

export type AppStore = AuthSlice & ThemeSlice & UiSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createAuthSlice(...a),
  ...createThemeSlice(...a),
  ...createUiSlice(...a),
}));
