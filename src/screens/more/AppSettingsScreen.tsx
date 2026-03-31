import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';

const MENU_ITEMS = [
  {
    key: 'LaunchScreen',
    title: 'Launch Screen',
    subtitle: 'Configure splash screen image or video',
    icon: 'L',
  },
  {
    key: 'AppInfo',
    title: 'App Information',
    subtitle: 'Package name, bundle ID, Firebase config',
    icon: 'I',
  },
];

export function AppSettingsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {MENU_ITEMS.map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.key)}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.cardInfo}>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  headerTitle: { ...typography.h4, color: colors.text },
  content: { padding: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.sm, ...shadows.sm,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '12', justifyContent: 'center', alignItems: 'center',
  },
  iconText: { ...typography.h4, color: colors.primary },
  cardInfo: { flex: 1 },
  cardTitle: { ...typography.bodyMedium, color: colors.text },
  cardSubtitle: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  chevron: { ...typography.body, color: colors.textTertiary },
});
