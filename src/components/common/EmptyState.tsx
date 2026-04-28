import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { ActionButton } from './ActionButton';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

export function EmptyState({
  icon = '∅',
  title,
  description,
  actionLabel,
  onAction,
  style,
  compact = false,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { padding: compact ? theme.spacing.lg : theme.spacing.xxl }, style]}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: theme.colors.primarySoft,
            width: compact ? 56 : 72,
            height: compact ? 56 : 72,
            borderRadius: theme.borderRadius.xl,
          },
        ]}>
        <Text style={[styles.icon, { color: theme.colors.primary }]}>{icon}</Text>
      </View>
      <Text
        style={[
          theme.typography.h4,
          { color: theme.colors.text, marginTop: theme.spacing.lg, textAlign: 'center' },
        ]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            theme.typography.body,
            {
              color: theme.colors.textSecondary,
              marginTop: theme.spacing.xs,
              textAlign: 'center',
              maxWidth: 320,
            },
          ]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <ActionButton
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: theme.spacing.lg }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  iconBox: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 28, fontWeight: '700' },
});
