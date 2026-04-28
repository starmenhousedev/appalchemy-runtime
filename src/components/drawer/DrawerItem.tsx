import React from 'react';
import { Pressable, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface DrawerBadge {
  label: string;
  tone?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

interface DrawerItemProps {
  icon: string;
  label: string;
  active?: boolean;
  badge?: DrawerBadge;
  onPress: () => void;
  style?: ViewStyle;
}

export function DrawerItem({ icon, label, active, badge, onPress, style }: DrawerItemProps) {
  const theme = useTheme();

  const badgePalette: Record<NonNullable<DrawerBadge['tone']>, { bg: string; fg: string }> = {
    primary: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
    success: { bg: theme.colors.successLight, fg: theme.colors.success },
    warning: { bg: theme.colors.warningLight, fg: theme.colors.warning },
    error: { bg: theme.colors.errorLight, fg: theme.colors.error },
    info: { bg: theme.colors.infoLight, fg: theme.colors.info },
    neutral: { bg: theme.colors.surfaceSecondary, fg: theme.colors.textSecondary },
  };
  const b = badge ? badgePalette[badge.tone ?? 'primary'] : null;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: theme.colors.primarySoft }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: active ? theme.colors.drawerActiveBg : pressed ? theme.colors.surfaceSecondary : 'transparent',
          borderRadius: theme.borderRadius.md,
          paddingVertical: 11,
          paddingHorizontal: theme.spacing.sm,
          marginVertical: 1,
        },
        style,
      ]}>
      {active ? (
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: theme.colors.primary,
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: active ? theme.colors.primary : theme.colors.surfaceSecondary,
            borderRadius: theme.borderRadius.md,
            marginLeft: theme.spacing.xs,
          },
        ]}>
        <Text
          style={[
            styles.iconText,
            { color: active ? '#fff' : theme.colors.textSecondary },
          ]}>
          {icon}
        </Text>
      </View>
      <Text
        style={[
          theme.typography.bodyMedium,
          {
            flex: 1,
            color: active ? theme.colors.primary : theme.colors.text,
            fontWeight: active ? '700' : '500',
            marginLeft: theme.spacing.md,
          },
        ]}
        numberOfLines={1}>
        {label}
      </Text>
      {b ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: b.bg, borderRadius: theme.borderRadius.round },
          ]}>
          <Text style={[styles.badgeText, { color: b.fg }]}>{badge!.label}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  indicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
  },
  iconBox: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});
