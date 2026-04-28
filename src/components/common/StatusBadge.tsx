import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: ViewStyle;
}

export function StatusBadge({ label, tone = 'neutral', size = 'sm', dot = false, style }: StatusBadgeProps) {
  const theme = useTheme();

  const tones: Record<StatusTone, { bg: string; fg: string }> = {
    success: { bg: theme.colors.successLight, fg: theme.colors.success },
    warning: { bg: theme.colors.warningLight, fg: theme.colors.warning },
    error: { bg: theme.colors.errorLight, fg: theme.colors.error },
    info: { bg: theme.colors.infoLight, fg: theme.colors.info },
    neutral: { bg: theme.colors.surfaceSecondary, fg: theme.colors.textSecondary },
    primary: { bg: theme.colors.primarySoft, fg: theme.colors.primary },
  };

  const t = tones[tone];
  const px = size === 'md' ? theme.spacing.md : theme.spacing.sm;
  const py = size === 'md' ? 5 : 3;
  const fontSize = size === 'md' ? 12 : 11;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: t.bg,
          paddingHorizontal: px,
          paddingVertical: py,
          borderRadius: theme.borderRadius.round,
        },
        style,
      ]}>
      {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
      <Text style={[styles.text, { color: t.fg, fontSize }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontWeight: '600', letterSpacing: 0.2 },
});
