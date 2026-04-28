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
import type { Page } from '../../types';

interface PageListPanelProps {
  pages: Page[];
  selectedPageId: number | null;
  onSelectPage: (page: Page) => void;
  onToggleVisibility: (pageId: number) => void;
  onDeletePage: (pageId: number) => void;
  onDuplicatePage: (pageId: number) => void;
  onAddPage: () => void;
  onReorder: (pageIds: number[]) => void;
  onEditPage?: (page: Page) => void;
}

export function PageListPanel({
  pages,
  selectedPageId,
  onSelectPage,
  onToggleVisibility,
  onDeletePage,
  onDuplicatePage,
  onAddPage,
  onEditPage,
}: PageListPanelProps) {
  const sortedPages = [...pages].sort((a, b) => a.sort_order - b.sort_order);

  const handleLongPress = (page: Page) => {
    const actions: Array<{ text: string; style?: 'destructive' | 'cancel'; onPress?: () => void }> = [];
    if (onEditPage) {
      actions.push({ text: 'Edit', onPress: () => onEditPage(page) });
    }
    actions.push(
      { text: page.is_visible ? 'Hide' : 'Show', onPress: () => onToggleVisibility(page.id) },
      { text: 'Duplicate', onPress: () => onDuplicatePage(page.id) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete Page', `Delete "${page.title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDeletePage(page.id) },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    );
    Alert.alert(page.title, 'Choose an action', actions);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Pages</Text>
          {sortedPages.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{sortedPages.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPage}
          activeOpacity={0.8}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedPages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.pageItem,
              item.id === selectedPageId && styles.pageItemActive,
              !item.is_visible && styles.pageItemHidden,
            ]}
            onPress={() => onSelectPage(item)}
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.7}>
            <View style={styles.dragHandle}>
              <Text style={styles.dragDots}>⠿</Text>
            </View>
            <View style={styles.pageInfo}>
              <Text
                style={[
                  styles.pageName,
                  item.id === selectedPageId && styles.pageNameActive,
                  !item.is_visible && styles.pageNameHidden,
                ]}
                numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.pageType} numberOfLines={1}>
                {item.type.replace(/_/g, ' ')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.visibilityBtn}
              onPress={() => onToggleVisibility(item.id)}
              hitSlop={8}>
              <Text style={[styles.visibilityIcon, !item.is_visible && styles.visibilityOff]}>
                {item.is_visible ? '◉' : '◎'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>No pages yet</Text>
            <Text style={styles.emptySub}>Tap + to create your first page</Text>
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
  pageItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.borderLight,
  },
  pageItemActive: { backgroundColor: colors.primary + '12' },
  pageItemHidden: { opacity: 0.5 },
  dragHandle: { paddingRight: spacing.sm },
  dragDots: { fontSize: 14, color: colors.textTertiary },
  pageInfo: { flex: 1 },
  pageName: { ...typography.captionMedium, color: colors.text },
  pageNameActive: { color: colors.primary },
  pageNameHidden: { fontStyle: 'italic' },
  pageType: { ...typography.small, color: colors.textTertiary, textTransform: 'capitalize', marginTop: 1 },
  visibilityBtn: { padding: spacing.xs },
  visibilityIcon: { fontSize: 14, color: colors.primary },
  visibilityOff: { color: colors.textTertiary },
  emptyState: { padding: spacing.xxl, alignItems: 'center' },
  emptyIcon: { fontSize: 24, marginBottom: spacing.xs },
  emptyText: { ...typography.captionMedium, color: colors.textSecondary },
  emptySub: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
});
