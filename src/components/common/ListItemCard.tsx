import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface ListItemCardProps {
  title: string;
  subtitle?: string;
  meta?: string;
  iconLabel?: string;
  iconColor?: string;
  trailing?: React.ReactNode;
  badge?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function ListItemCard({
  title,
  subtitle,
  meta,
  iconLabel,
  iconColor,
  trailing,
  badge,
  onPress,
  style,
  disabled,
}: ListItemCardProps) {
  const theme = useTheme();
  const accent = iconColor ?? theme.colors.primary;

  const Wrapper: React.ElementType = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.card,
        theme.shadows.sm,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}>
      {iconLabel ? (
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: accent + '22',
              borderRadius: theme.borderRadius.md,
              marginRight: theme.spacing.md,
            },
          ]}>
          <Text style={[styles.iconText, { color: accent }]}>{iconLabel}</Text>
        </View>
      ) : null}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[theme.typography.bodyMedium, { color: theme.colors.text, flex: 1 }]}
            numberOfLines={1}>
            {title}
          </Text>
          {badge}
        </View>
        {subtitle ? (
          <Text
            style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}
            numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text
            style={[theme.typography.caption, { color: theme.colors.textTertiary, marginTop: 4 }]}
            numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>{'›'}</Text> : null)}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chevron: { fontSize: 22, fontWeight: '500', paddingHorizontal: 4 },
});
