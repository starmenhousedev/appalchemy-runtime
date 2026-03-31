import { StateCreator } from 'zustand';
import { themesApi } from '../../api';
import type { Theme, ImportedTheme } from '../../types';

export interface ThemeSlice {
  starterThemes: Theme[];
  importedThemes: ImportedTheme[];
  activeTheme: ImportedTheme | null;
  isLoadingThemes: boolean;
  loadStarterThemes: () => Promise<void>;
  loadImportedThemes: () => Promise<void>;
  importTheme: (themeId: number) => Promise<ImportedTheme>;
  setActiveTheme: (theme: ImportedTheme | null) => void;
}

export const createThemeSlice: StateCreator<ThemeSlice> = (set, _get) => ({
  starterThemes: [],
  importedThemes: [],
  activeTheme: null,
  isLoadingThemes: false,

  loadStarterThemes: async () => {
    set({ isLoadingThemes: true });
    try {
      const themes = await themesApi.listThemes();
      set({ starterThemes: themes });
    } finally {
      set({ isLoadingThemes: false });
    }
  },

  loadImportedThemes: async () => {
    set({ isLoadingThemes: true });
    try {
      const themes = await themesApi.listImported();
      set({ importedThemes: themes });
      const active = themes.find(t => t.is_active) || null;
      set({ activeTheme: active });
    } finally {
      set({ isLoadingThemes: false });
    }
  },

  importTheme: async (themeId: number) => {
    const imported = await themesApi.importTheme(themeId);
    set(state => ({
      importedThemes: [...state.importedThemes, imported],
    }));
    return imported;
  },

  setActiveTheme: (theme: ImportedTheme | null) => {
    set({ activeTheme: theme });
  },
});
