import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';

interface MenuItem {
  title: string;
  subtitle: string;
  screen: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { title: 'Manage Themes', subtitle: 'View, edit, and organize your themes', screen: 'ManageThemes', icon: 'T' },
  { title: 'Theme Calendar', subtitle: 'Schedule theme activations', screen: 'ThemeCalendar', icon: 'C' },
  { title: 'Integrations', subtitle: 'Connect third-party services', screen: 'Integrations', icon: 'I' },
  { title: 'App Links', subtitle: 'Deep links and onelinks', screen: 'AppLinks', icon: 'L' },
  { title: 'App Settings', subtitle: 'Launch screen and app info', screen: 'AppSettings', icon: 'S' },
  { title: 'Manage Users', subtitle: 'Team members and permissions', screen: 'ManageUsers', icon: 'U' },
  { title: 'Billing', subtitle: 'Plans and payment history', screen: 'Billing', icon: 'B' },
  { title: 'Publish', subtitle: 'Build and submit your app', screen: 'Publish', icon: 'P' },
];

export function MoreMenuScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>|||</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.screen}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, gap: spacing.md,
  },
  menuButton: {
    width: 36, height: 36, borderRadius: borderRadius.md,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadows.sm,
  },
  menuIcon: { fontSize: 16, color: colors.text, letterSpacing: -2 },
  headerTitle: { ...typography.h2, color: colors.text },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.sm, ...shadows.sm,
  },
  iconContainer: {
    width: 40, height: 40, borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  iconText: { ...typography.h4, color: colors.primary },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.bodyMedium, color: colors.text },
  cardSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  chevron: { ...typography.h4, color: colors.textTertiary },
});
