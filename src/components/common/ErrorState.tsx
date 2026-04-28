import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { ActionButton } from './ActionButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  onRetry,
  retryLabel = 'Try again',
  style,
  compact = false,
}: ErrorStateProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        { padding: compact ? theme.spacing.lg : theme.spacing.xxl },
        style,
      ]}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: theme.colors.errorLight, borderRadius: theme.borderRadius.xl },
        ]}>
        <Text style={[styles.icon, { color: theme.colors.error }]}>!</Text>
      </View>
      <Text
        style={[
          theme.typography.h4,
          { color: theme.colors.text, marginTop: theme.spacing.lg, textAlign: 'center' },
        ]}>
        {title}
      </Text>
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
        {message}
      </Text>
      {onRetry ? (
        <ActionButton
          label={retryLabel}
          onPress={onRetry}
          variant="outline"
          style={{ marginTop: theme.spacing.lg }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 28, fontWeight: '700' },
});
