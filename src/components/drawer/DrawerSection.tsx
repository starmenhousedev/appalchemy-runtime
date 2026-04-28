import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface DrawerSectionProps {
  title?: string;
  children: React.ReactNode;
  showDivider?: boolean;
}

export function DrawerSection({ title, children, showDivider = true }: DrawerSectionProps) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.spacing.md }}>
      {showDivider ? (
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.divider, marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
          ]}
        />
      ) : null}
      {title ? (
        <Text
          style={[
            theme.typography.small,
            {
              color: theme.colors.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontWeight: '700',
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.sm,
            },
          ]}>
          {title}
        </Text>
      ) : null}
      <View style={{ paddingHorizontal: theme.spacing.sm }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth },
});
