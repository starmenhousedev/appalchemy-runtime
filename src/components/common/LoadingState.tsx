import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface LoadingStateProps {
  message?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export function LoadingState({ message = 'Loading…', style, fullScreen = false }: LoadingStateProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        fullScreen ? styles.full : styles.inline,
        fullScreen ? { backgroundColor: theme.colors.background } : null,
        style,
      ]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, marginTop: theme.spacing.md },
          ]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inline: { padding: 32, alignItems: 'center', justifyContent: 'center' },
});
