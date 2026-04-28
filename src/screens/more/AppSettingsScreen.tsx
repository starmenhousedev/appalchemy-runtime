import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ListItemCard } from '../../components/common/ListItemCard';

const MENU_ITEMS = [
  {
    key: 'LaunchScreen',
    title: 'Launch Screen',
    subtitle: 'Configure splash screen image or video',
    glyph: '◐',
    tone: 'primary' as const,
  },
  {
    key: 'AppInfo',
    title: 'App Information',
    subtitle: 'Package name, bundle ID, Firebase config',
    glyph: 'ⓘ',
    tone: 'info' as const,
  },
];

export function AppSettingsScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.sm },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="App Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {MENU_ITEMS.map(item => (
          <ListItemCard
            key={item.key}
            title={item.title}
            subtitle={item.subtitle}
            iconLabel={item.glyph}
            iconColor={theme.colors[item.tone]}
            onPress={() => navigation.navigate(item.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
