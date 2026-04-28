import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { useTheme } from '../../theme';

export interface FilterChipOption<T extends string | number = string> {
  label: string;
  value: T;
  count?: number;
}

interface FilterChipsProps<T extends string | number = string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (val: T) => void;
  style?: ViewStyle;
  scrollable?: boolean;
}

export function FilterChips<T extends string | number = string>({
  options,
  value,
  onChange,
  style,
  scrollable = true,
}: FilterChipsProps<T>) {
  const theme = useTheme();

  const renderChip = (opt: FilterChipOption<T>) => {
    const active = opt.value === value;
    return (
      <TouchableOpacity
        key={String(opt.value)}
        onPress={() => onChange(opt.value)}
        activeOpacity={0.8}
        style={[
          styles.chip,
          {
            backgroundColor: active ? theme.colors.primary : theme.colors.surfaceSecondary,
            borderColor: active ? theme.colors.primary : theme.colors.borderLight,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: 7,
            borderRadius: theme.borderRadius.round,
          },
        ]}>
        <Text
          style={[
            theme.typography.captionMedium,
            { color: active ? theme.colors.textInverse : theme.colors.text },
          ]}>
          {opt.label}
          {typeof opt.count === 'number' ? ` · ${opt.count}` : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!scrollable) {
    return <View style={[styles.row, style]}>{options.map(renderChip)}</View>;
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}>
      {options.map(renderChip)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chip: { borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
});
