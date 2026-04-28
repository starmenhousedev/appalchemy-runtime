import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  message = 'Loading...',
  fullScreen = false,
}: LoadingOverlayProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.container,
        fullScreen ? { backgroundColor: theme.colors.background } : null,
      ]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12 }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 40, justifyContent: 'center', alignItems: 'center' },
});
