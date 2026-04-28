import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'transparent';
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  onMenu,
  right,
  style,
  variant = 'default',
}: AppHeaderProps) {
  const theme = useTheme();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: variant === 'transparent' ? 'transparent' : theme.colors.headerBg,
      borderBottomColor: variant === 'transparent' ? 'transparent' : theme.colors.borderLight,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: variant === 'transparent' ? 0 : StyleSheet.hairlineWidth,
    },
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
            hitSlop={8}>
            <Text style={[styles.iconText, { color: theme.colors.text }]}>{'<'}</Text>
          </TouchableOpacity>
        ) : onMenu ? (
          <TouchableOpacity
            onPress={onMenu}
            style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
            hitSlop={8}>
            <Text style={[styles.menuIcon, { color: theme.colors.text }]}>≡</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  left: { width: 40, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  right: { minWidth: 40, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 18, fontWeight: '700' },
  menuIcon: { fontSize: 22, fontWeight: '700', lineHeight: 22 },
});
