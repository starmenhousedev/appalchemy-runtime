import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
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
}

export function PageListPanel({
  pages,
  selectedPageId,
  onSelectPage,
  onToggleVisibility,
  onDeletePage,
  onDuplicatePage,
  onAddPage,
}: PageListPanelProps) {
  const sortedPages = [...pages].sort((a, b) => a.sort_order - b.sort_order);

  const handleLongPress = (page: Page) => {
    Alert.alert(page.title, 'Choose an action', [
      { text: page.is_visible ? 'Hide' : 'Show', onPress: () => onToggleVisibility(page.id) },
      { text: 'Duplicate', onPress: () => onDuplicatePage(page.id) },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => Alert.alert('Delete Page', `Delete "${page.title}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDeletePage(page.id) },
        ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pages</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddPage}>
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
              <Text style={styles.pageType}>
                {item.type.replace(/_/g, ' ')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.visibilityBtn}
              onPress={() => onToggleVisibility(item.id)}>
              <Text style={[styles.visibilityIcon, !item.is_visible && styles.visibilityOff]}>
                {item.is_visible ? '◉' : '◎'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No pages yet</Text>
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
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  headerTitle: { ...typography.captionMedium, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  addButton: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary,
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
  emptyText: { ...typography.caption, color: colors.textTertiary },
});
