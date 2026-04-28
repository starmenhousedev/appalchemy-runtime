import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { StatusBadge } from '../common/StatusBadge';

interface DrawerHeaderProps {
  appName: string;
  shopName?: string | null;
  initials?: string;
  paddingTop: number;
  status?: { label: string; tone: 'success' | 'warning' | 'error' | 'neutral' | 'info' };
}

export function DrawerHeader({ appName, shopName, initials = 'A', paddingTop, status }: DrawerHeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: paddingTop + theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.lg,
        },
      ]}>
      <View style={styles.row}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.lg }]}>
          <Text style={styles.logoText}>{initials.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
          <Text style={[theme.typography.h4, { color: theme.colors.text }]} numberOfLines={1}>
            {appName}
          </Text>
          {shopName ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {shopName}
            </Text>
          ) : null}
        </View>
      </View>
      {status ? (
        <View style={{ marginTop: theme.spacing.md }}>
          <StatusBadge label={status.label} tone={status.tone} dot />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '700', color: '#fff' },
});
