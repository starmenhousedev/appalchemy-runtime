import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';

interface PlaceholderScreenProps {
  route: { name: string };
  navigation: { goBack: () => void };
}

export function PlaceholderScreen({ route, navigation }: PlaceholderScreenProps) {
  const insets = useSafeAreaInsets();
  const title = route.name.replace(/([A-Z])/g, ' $1').trim();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.body}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{title.charAt(0)}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>This feature is coming soon</Text>
      </View>
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
  spacer: { width: 60 },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  iconBox: {
    width: 64, height: 64, borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
  },
  iconText: { fontSize: 28, fontWeight: '700', color: colors.primary },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary },
});
