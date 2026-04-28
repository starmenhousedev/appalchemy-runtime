import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { SECTION_TYPES } from '../../utils/constants';
import type { Section } from '../../types';

interface SectionListPanelProps {
  sections: Section[];
  selectedSectionId: number | null;
  onSelectSection: (section: Section) => void;
  onToggleVisibility: (sectionId: number) => void;
  onDeleteSection: (sectionId: number) => void;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onReorder?: (sectionIds: number[]) => void;
}

export function SectionListPanel({
  sections,
  selectedSectionId,
  onSelectSection,
  onToggleVisibility,
  onDeleteSection,
  onAddSection,
  onEditSection,
  onReorder,
}: SectionListPanelProps) {
  const sortedSections = [...sections].sort((a, b) => a.sort_order - b.sort_order);

  const getTypeLabel = (type: string) =>
    SECTION_TYPES.find(s => s.value === type)?.label || type.replace(/_/g, ' ');

  const handleMove = (sectionId: number, direction: -1 | 1) => {
    if (!onReorder) return;
    const idx = sortedSections.findIndex(s => s.id === sectionId);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sortedSections.length) return;
    const next = [...sortedSections];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    onReorder(next.map(s => s.id));
  };

  const handleLongPress = (section: Section) => {
    Alert.alert(section.title || getTypeLabel(section.type), 'Choose an action', [
      { text: 'Edit', onPress: () => onEditSection(section) },
      { text: section.is_visible ? 'Hide' : 'Show', onPress: () => onToggleVisibility(section.id) },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => Alert.alert('Delete Section', 'Are you sure?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDeleteSection(section.id) },
        ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Sections</Text>
          {sortedSections.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{sortedSections.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddSection}
          activeOpacity={0.8}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedSections}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.sectionItem,
              item.id === selectedSectionId && styles.sectionItemActive,
              !item.is_visible && styles.sectionItemHidden,
            ]}
            onPress={() => onSelectSection(item)}
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.7}>
            <View style={styles.dragHandle}>
              {onReorder ? (
                <>
                  <TouchableOpacity
                    onPress={() => handleMove(item.id, -1)}
                    disabled={index === 0}
                    hitSlop={6}>
                    <Text style={[styles.dragDots, index === 0 && { opacity: 0.3 }]}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleMove(item.id, 1)}
                    disabled={index === sortedSections.length - 1}
                    hitSlop={6}>
                    <Text
                      style={[
                        styles.dragDots,
                        index === sortedSections.length - 1 && { opacity: 0.3 },
                      ]}>
                      ↓
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.dragDots}>⠿</Text>
              )}
            </View>
            <View style={styles.typeIndicator}>
              <Text style={styles.typeInitial}>
                {item.type.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.sectionInfo}>
              <Text
                style={[
                  styles.sectionName,
                  item.id === selectedSectionId && styles.sectionNameActive,
                ]}
                numberOfLines={1}>
                {item.title || getTypeLabel(item.type)}
              </Text>
              <Text style={styles.sectionType}>
                {getTypeLabel(item.type)}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onToggleVisibility(item.id)}>
                <Text style={[styles.visibilityIcon, !item.is_visible && styles.visibilityOff]}>
                  {item.is_visible ? '◉' : '◎'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧩</Text>
            <Text style={styles.emptyText}>No sections yet</Text>
            <Text style={styles.emptySubtext}>Tap + to start building this page</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { ...typography.captionMedium, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  countPill: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  countPillText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addButton: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  addIcon: { color: '#FFF', fontSize: 16, fontWeight: '600', lineHeight: 18 },
  sectionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.borderLight,
  },
  sectionItemActive: { backgroundColor: colors.primary + '12' },
  sectionItemHidden: { opacity: 0.5 },
  dragHandle: { paddingRight: spacing.xs },
  dragDots: { fontSize: 14, color: colors.textTertiary },
  typeIndicator: {
    width: 24, height: 24, borderRadius: 4,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm,
  },
  typeInitial: { fontSize: 10, fontWeight: '700', color: colors.primary },
  sectionInfo: { flex: 1 },
  sectionName: { ...typography.captionMedium, color: colors.text },
  sectionNameActive: { color: colors.primary },
  sectionType: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  actions: { flexDirection: 'row', gap: spacing.xs },
  actionBtn: { padding: spacing.xs },
  visibilityIcon: { fontSize: 14, color: colors.primary },
  visibilityOff: { color: colors.textTertiary },
  emptyState: { padding: spacing.xxl, alignItems: 'center' },
  emptyIcon: { fontSize: 24, marginBottom: spacing.xs },
  emptyText: { ...typography.captionMedium, color: colors.textSecondary },
  emptySubtext: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
});
