import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

export interface DateRange {
  label: string;
  date_from: string;
  date_to: string;
  compare_from?: string;
  compare_to?: string;
}

const today = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const PRESET_RANGES: DateRange[] = [
  { label: 'Today', date_from: today(), date_to: today(), compare_from: daysAgo(1), compare_to: daysAgo(1) },
  { label: 'Last 7 days', date_from: daysAgo(7), date_to: today(), compare_from: daysAgo(14), compare_to: daysAgo(8) },
  { label: 'Last 14 days', date_from: daysAgo(14), date_to: today(), compare_from: daysAgo(28), compare_to: daysAgo(15) },
  { label: 'Last 30 days', date_from: daysAgo(30), date_to: today(), compare_from: daysAgo(60), compare_to: daysAgo(31) },
  { label: 'Last 90 days', date_from: daysAgo(90), date_to: today(), compare_from: daysAgo(180), compare_to: daysAgo(91) },
];

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onSelectRange: (range: DateRange) => void;
  compareEnabled: boolean;
  onToggleCompare: (enabled: boolean) => void;
}

export function DateRangeSelector({
  selectedRange,
  onSelectRange,
  compareEnabled,
  onToggleCompare,
}: DateRangeSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}>
        <Text style={styles.calendarIcon}>{'[ ]'}</Text>
        <Text style={styles.selectorText}>{selectedRange.label}</Text>
        <Text style={styles.chevron}>v</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.compareBtn, compareEnabled && styles.compareBtnActive]}
        onPress={() => onToggleCompare(!compareEnabled)}
        activeOpacity={0.7}>
        <Text style={[styles.compareText, compareEnabled && styles.compareTextActive]}>
          Compare
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Select Date Range</Text>
            <FlatList
              data={PRESET_RANGES}
              keyExtractor={item => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.rangeItem,
                    item.label === selectedRange.label && styles.rangeItemActive,
                  ]}
                  onPress={() => {
                    onSelectRange(item);
                    setModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.rangeLabel,
                      item.label === selectedRange.label && styles.rangeLabelActive,
                    ]}>
                    {item.label}
                  </Text>
                  <Text style={styles.rangeDates}>
                    {item.date_from} — {item.date_to}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export { PRESET_RANGES };

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  selector: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.border, flex: 1,
    ...shadows.sm,
  },
  calendarIcon: { fontSize: 12, color: colors.textTertiary },
  selectorText: { ...typography.captionMedium, color: colors.text, flex: 1 },
  chevron: { ...typography.caption, color: colors.textTertiary },
  compareBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  compareBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  compareText: { ...typography.captionMedium, color: colors.textSecondary },
  compareTextActive: { color: colors.primary },
  overlay: {
    flex: 1, backgroundColor: colors.overlay,
    justifyContent: 'center', alignItems: 'center', padding: spacing.xxl,
  },
  dropdown: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, width: '100%', maxWidth: 360,
    ...shadows.lg,
  },
  dropdownTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.md },
  rangeItem: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md, marginBottom: 2,
  },
  rangeItemActive: { backgroundColor: colors.primary + '12' },
  rangeLabel: { ...typography.bodyMedium, color: colors.text },
  rangeLabelActive: { color: colors.primary },
  rangeDates: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
});
