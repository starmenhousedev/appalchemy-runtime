import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../theme';
import { useStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import type { DrawerParamList, MoreStackParamList } from '../../navigation/types';

type Nav = StackNavigationProp<MoreStackParamList, 'MoreMenu'>;

interface MenuItem {
  title: string;
  subtitle: string;
  screen: keyof MoreStackParamList;
  glyph: string;
  tone: 'primary' | 'success' | 'info' | 'warning' | 'secondary';
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const GROUPS: MenuGroup[] = [
  {
    title: 'Storefront',
    items: [
      { title: 'Theme Catalog', subtitle: 'Browse and import starter themes', screen: 'ThemeCatalog', glyph: '◧', tone: 'primary' },
      { title: 'Manage Themes', subtitle: 'View, edit, organize themes', screen: 'ManageThemes', glyph: '◫', tone: 'primary' },
      { title: 'Theme Calendar', subtitle: 'Schedule theme activations', screen: 'ThemeCalendar', glyph: '◔', tone: 'info' },
      { title: 'Launch Screen', subtitle: 'Splash and onboarding', screen: 'LaunchScreen', glyph: '◐', tone: 'secondary' },
    ],
  },
  {
    title: 'Connect',
    items: [
      { title: 'Integrations', subtitle: 'Connect third-party services', screen: 'Integrations', glyph: '⚯', tone: 'success' },
      { title: 'App Links', subtitle: 'Deep links and shortlinks', screen: 'AppLinks', glyph: '⤴', tone: 'info' },
      { title: 'Shopify Data', subtitle: 'Browse products, collections, orders', screen: 'ShopifyData', glyph: '⌘', tone: 'success' },
    ],
  },
  {
    title: 'Content',
    items: [
      { title: 'Media Library', subtitle: 'Images, videos and files', screen: 'MediaLibrary', glyph: '◇', tone: 'info' },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      { title: 'App Settings', subtitle: 'General app preferences', screen: 'AppSettings', glyph: '⚙', tone: 'secondary' },
      { title: 'App Info', subtitle: 'Build, version, debug', screen: 'AppInfo', glyph: 'ⓘ', tone: 'primary' },
      { title: 'Manage Users', subtitle: 'Team and permissions', screen: 'ManageUsers', glyph: '◉', tone: 'warning' },
      { title: 'Billing', subtitle: 'Plans and payment history', screen: 'Billing', glyph: '$', tone: 'success' },
    ],
  },
  {
    title: 'Release',
    items: [
      { title: 'Publish', subtitle: 'Build and submit your app', screen: 'Publish', glyph: '↑', tone: 'primary' },
    ],
  },
];

interface Props {
  navigation: Nav;
}

export function MoreMenuScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const logout = useStore(s => s.logout);
  const shop = useStore(s => s.shop);

  const drawerNav = navigation.getParent<DrawerNavigationProp<DrawerParamList>>();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        scroll: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom },
        groupTitle: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
          marginLeft: theme.spacing.sm,
        },
        groupCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          overflow: 'hidden',
          ...theme.shadows.sm,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          gap: theme.spacing.md,
        },
        rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.divider },
        glyphBox: { width: 40, height: 40, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
        glyph: { fontSize: 18, fontWeight: '700' },
        title: { ...theme.typography.bodyMedium, color: theme.colors.text },
        subtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
        chevron: { fontSize: 22, color: theme.colors.textTertiary, fontWeight: '500' },
        logoutBtn: {
          marginTop: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          alignItems: 'center',
          borderRadius: theme.borderRadius.md,
          borderWidth: 1.5,
          borderColor: theme.colors.error + '50',
          backgroundColor: theme.colors.errorLight,
        },
        logoutText: { ...theme.typography.bodyMedium, color: theme.colors.error },
        version: {
          ...theme.typography.caption,
          color: theme.colors.textTertiary,
          textAlign: 'center',
          marginTop: theme.spacing.md,
        },
      }),
    [theme, insets.bottom],
  );

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="More"
        subtitle={shop?.shop_name || shop?.shop_domain || undefined}
        onMenu={() => drawerNav?.openDrawer()}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {GROUPS.map(group => (
          <View key={group.title}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, idx) => {
                const accent = theme.colors[item.tone];
                const isLast = idx === group.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.screen}
                    style={[styles.row, !isLast && styles.rowDivider]}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate(item.screen as never)}>
                    <View style={[styles.glyphBox, { backgroundColor: accent + '22' }]}>
                      <Text style={[styles.glyph, { color: accent }]}>{item.glyph}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.subtitle}>{item.subtitle}</Text>
                    </View>
                    <Text style={styles.chevron}>{'›'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>AppAlchemy · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
