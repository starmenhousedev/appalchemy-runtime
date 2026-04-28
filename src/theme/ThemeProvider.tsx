import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { lightColors, darkColors, Palette } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';
import { shadows, darkShadows } from './shadows';

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  colors: Palette;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  shadows: typeof shadows;
}

const buildTheme = (mode: ThemeMode): AppTheme => ({
  mode,
  isDark: mode === 'dark',
  colors: mode === 'dark' ? darkColors : lightColors,
  spacing,
  borderRadius,
  typography,
  shadows: mode === 'dark' ? darkShadows : shadows,
});

const ThemeContext = createContext<AppTheme>(buildTheme('light'));

interface ThemeProviderProps {
  children: React.ReactNode;
  forceMode?: ThemeMode;
}

const resolveMode = (scheme: ColorSchemeName | null | undefined): ThemeMode =>
  scheme === 'dark' ? 'dark' : 'light';

export function ThemeProvider({ children, forceMode }: ThemeProviderProps) {
  const [systemMode, setSystemMode] = useState<ThemeMode>(() =>
    resolveMode(Appearance.getColorScheme()),
  );

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemMode(resolveMode(colorScheme));
    });
    return () => listener.remove();
  }, []);

  const theme = useMemo(
    () => buildTheme(forceMode ?? systemMode),
    [forceMode, systemMode],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
