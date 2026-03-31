import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';
import { useStore } from '../../store';
import type { ToastMessage } from '../../store/slices/uiSlice';

const toastColors: Record<ToastMessage['type'], { bg: string; text: string }> = {
  success: { bg: colors.successLight, text: '#155724' },
  error: { bg: colors.errorLight, text: '#721c24' },
  warning: { bg: colors.warningLight, text: '#856404' },
  info: { bg: colors.infoLight, text: '#0c5460' },
};

function ToastItem({ toast }: { toast: ToastMessage }) {
  const dismissToast = useStore(s => s.dismissToast);
  const colorScheme = toastColors[toast.type];

  return (
    <Animated.View style={[styles.toast, { backgroundColor: colorScheme.bg }]}>
      <Text style={[styles.toastText, { color: colorScheme.text }]}>
        {toast.message}
      </Text>
      <TouchableOpacity onPress={() => dismissToast(toast.id)}>
        <Text style={[styles.dismiss, { color: colorScheme.text }]}>x</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastContainer() {
  const toasts = useStore(s => s.toasts);
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + spacing.sm }]}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    gap: spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  toastText: {
    flex: 1,
    ...typography.bodyMedium,
  },
  dismiss: {
    ...typography.h4,
    paddingLeft: spacing.md,
  },
});
