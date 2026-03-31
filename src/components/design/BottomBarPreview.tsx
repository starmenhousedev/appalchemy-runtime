import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import type { BottomBarItem } from '../../types';

interface BottomBarPreviewProps {
  items: BottomBarItem[];
}

export function BottomBarPreview({ items }: BottomBarPreviewProps) {
  const visibleItems = items
    .filter(i => i.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 5);

  return (
    <View style={styles.container}>
      {visibleItems.map((item, index) => (
        <View key={item.id} style={styles.item}>
          <View
            style={[
              styles.icon,
              index === 0 && styles.iconActive,
            ]}
          />
          <Text
            style={[
              styles.label,
              index === 0 && styles.labelActive,
            ]}
            numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
    opacity: 0.3,
  },
  iconActive: {
    backgroundColor: colors.primary,
    opacity: 1,
  },
  label: {
    fontSize: 9,
    color: colors.textTertiary,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
