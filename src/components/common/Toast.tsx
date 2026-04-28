import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useStore } from '../../store';
import type { ToastMessage } from '../../store/slices/uiSlice';

function ToastItem({ toast }: { toast: ToastMessage }) {
  const theme = useTheme();
  const dismissToast = useStore(s => s.dismissToast);

  const palette: Record<ToastMessage['type'], { bg: string; fg: string }> = {
    success: { bg: theme.colors.successLight, fg: theme.colors.success },
    error: { bg: theme.colors.errorLight, fg: theme.colors.error },
    warning: { bg: theme.colors.warningLight, fg: theme.colors.warning },
    info: { bg: theme.colors.infoLight, fg: theme.colors.info },
  };
  const c = palette[toast.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        theme.shadows.md,
        {
          backgroundColor: c.bg,
          borderColor: c.fg + '40',
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
      ]}>
      <Text style={[theme.typography.bodyMedium, { color: c.fg, flex: 1 }]}>{toast.message}</Text>
      <TouchableOpacity onPress={() => dismissToast(toast.id)} hitSlop={8}>
        <Text style={[styles.dismiss, { color: c.fg }]}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastContainer() {
  const toasts = useStore(s => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  dismiss: { fontSize: 22, fontWeight: '600', paddingLeft: 12 },
});
