import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';

export type ActionVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ActionSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: ActionVariant;
  size?: ActionSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function ActionButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  labelStyle,
}: ActionButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const palette: Record<ActionVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: theme.colors.primary, text: theme.colors.textInverse },
    secondary: { bg: theme.colors.secondary, text: theme.colors.textInverse },
    outline: {
      bg: 'transparent',
      text: theme.colors.primary,
      border: theme.colors.primary,
    },
    ghost: { bg: 'transparent', text: theme.colors.primary },
    danger: { bg: theme.colors.error, text: theme.colors.textInverse },
    success: { bg: theme.colors.success, text: theme.colors.textInverse },
  };

  const sizing: Record<ActionSize, { px: number; py: number; minHeight: number; font: number }> = {
    sm: { px: theme.spacing.md, py: theme.spacing.xs, minHeight: 32, font: 12 },
    md: { px: theme.spacing.lg, py: theme.spacing.sm + 2, minHeight: 44, font: 14 },
    lg: { px: theme.spacing.xl, py: theme.spacing.md, minHeight: 52, font: 16 },
  };

  const v = palette[variant];
  const s = sizing[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.btn,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1.5 : 0,
          paddingHorizontal: s.px,
          paddingVertical: s.py,
          minHeight: s.minHeight,
          borderRadius: theme.borderRadius.md,
          opacity: isDisabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              { color: v.text, fontSize: s.font },
              labelStyle,
            ]}
            numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { fontWeight: '600' },
});
