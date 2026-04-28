import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (val: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onSubmit?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search…',
  onClear,
  onSubmit,
  style,
  autoFocus,
}: SearchBarProps) {
  const theme = useTheme();
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceSecondary,
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: theme.spacing.md,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}>
      <Text style={[styles.icon, { color: theme.colors.textTertiary }]}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        style={[styles.input, { color: theme.colors.text, ...theme.typography.body }]}
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity onPress={handleClear} hitSlop={8}>
          <Text style={[styles.clear, { color: theme.colors.textSecondary }]}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 8 },
  icon: { fontSize: 18 },
  input: { flex: 1, paddingVertical: 8 },
  clear: { fontSize: 22, fontWeight: '600', paddingHorizontal: 4 },
});
