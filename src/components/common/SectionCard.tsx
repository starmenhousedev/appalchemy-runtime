import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  children?: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  padded?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  style,
  contentStyle,
  padded = true,
}: SectionCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        theme.shadows.sm,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}>
      {(title || action) && (
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: theme.spacing.lg,
              paddingTop: theme.spacing.lg,
              paddingBottom: subtitle ? theme.spacing.sm : theme.spacing.md,
            },
          ]}>
          <View style={{ flex: 1 }}>
            {title ? (
              <Text style={[theme.typography.h4, { color: theme.colors.text }]}>{title}</Text>
            ) : null}
            {subtitle ? (
              <Text
                style={[
                  theme.typography.caption,
                  { color: theme.colors.textSecondary, marginTop: 2 },
                ]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {action ? (
            <TouchableOpacity onPress={action.onPress} hitSlop={8}>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.primary }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
      <View
        style={[
          padded
            ? {
                paddingHorizontal: theme.spacing.lg,
                paddingBottom: theme.spacing.lg,
                paddingTop: title ? 0 : theme.spacing.lg,
              }
            : null,
          contentStyle,
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  header: { flexDirection: 'row', alignItems: 'center' },
});
