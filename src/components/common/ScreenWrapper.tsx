import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: { top?: boolean; bottom?: boolean };
  background?: 'default' | 'elevated';
}

export function ScreenWrapper({
  children,
  scroll = false,
  refreshing,
  onRefresh,
  style,
  contentStyle,
  edges = { top: true, bottom: false },
  background = 'default',
}: ScreenWrapperProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const bg = background === 'elevated' ? theme.colors.backgroundElevated : theme.colors.background;
  const paddingTop = edges.top ? insets.top : 0;
  const paddingBottom = edges.bottom ? insets.bottom : 0;

  const containerStyle = [
    styles.container,
    { backgroundColor: bg, paddingTop, paddingBottom },
    style,
  ];

  return (
    <View style={containerStyle}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={bg}
      />
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            ) : undefined
          }>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
