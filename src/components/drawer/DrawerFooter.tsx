import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '../../theme';

interface DrawerFooterProps {
  version?: string;
  onLogout: () => void;
  onSupport?: () => void;
  paddingBottom: number;
}

export function DrawerFooter({ version = '1.0.0', onLogout, onSupport, paddingBottom }: DrawerFooterProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: paddingBottom + theme.spacing.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
          backgroundColor: theme.colors.drawerBg,
        },
      ]}>
      {onSupport ? (
        <Pressable
          onPress={onSupport}
          android_ripple={{ color: theme.colors.primarySoft }}
          style={({ pressed }) => [
            styles.supportRow,
            {
              backgroundColor: pressed ? theme.colors.surfaceSecondary : 'transparent',
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
            },
          ]}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: theme.colors.surfaceSecondary, borderRadius: theme.borderRadius.md },
            ]}>
            <Text style={[styles.iconText, { color: theme.colors.textSecondary }]}>?</Text>
          </View>
          <Text
            style={[
              theme.typography.bodyMedium,
              { color: theme.colors.text, marginLeft: theme.spacing.md, flex: 1 },
            ]}>
            Help & Support
          </Text>
        </Pressable>
      ) : null}

      <TouchableOpacity
        onPress={onLogout}
        activeOpacity={0.85}
        style={[
          styles.logoutBtn,
          {
            borderColor: theme.colors.error + '60',
            backgroundColor: theme.colors.errorLight,
            borderRadius: theme.borderRadius.md,
            paddingVertical: theme.spacing.sm + 2,
          },
        ]}>
        <Text style={[styles.logoutGlyph, { color: theme.colors.error }]}>⎋</Text>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.error, marginLeft: 8, fontWeight: '700' }]}>
          Log out
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          theme.typography.small,
          { color: theme.colors.textTertiary, textAlign: 'center', marginTop: theme.spacing.sm },
        ]}>
        AppAlchemy · v{version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  supportRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 16, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoutGlyph: { fontSize: 16, fontWeight: '700' },
});
