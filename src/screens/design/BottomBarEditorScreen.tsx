import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bottomBarApi, pagesApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import type { BottomBarItem, Page } from '../../types';

export function BottomBarEditorScreen({
  route,
  navigation,
}: {
  route: { params: { themeId: number } };
  navigation: any;
}) {
  const { themeId } = route.params;
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BottomBarItem[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [editingItem, setEditingItem] = useState<BottomBarItem | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');

  // Add item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('home');
  const [newPageId, setNewPageId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [barItems, pageList] = await Promise.all([
        bottomBarApi.get(themeId),
        pagesApi.list(themeId),
      ]);
      setItems(barItems);
      setPages(pageList);
    } catch {
      showToast('error', 'Failed to load bottom bar');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newLabel.trim() || !newPageId) {
      showToast('error', 'Label and page are required');
      return;
    }
    try {
      const item = await bottomBarApi.addItem(themeId, {
        label: newLabel.trim(),
        icon: newIcon.trim() || 'home',
        page_id: newPageId,
      });
      setItems(prev => [...prev, item]);
      setShowAddForm(false);
      setNewLabel('');
      setNewIcon('home');
      setNewPageId(null);
      showToast('success', 'Item added');
    } catch {
      showToast('error', 'Failed to add item');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      const updated = await bottomBarApi.updateItem(themeId, editingItem.id, {
        label: editLabel.trim(),
        icon: editIcon.trim(),
      } as Partial<BottomBarItem>);
      setItems(prev => prev.map(i => (i.id === editingItem.id ? updated : i)));
      setEditingItem(null);
      showToast('success', 'Item updated');
    } catch {
      showToast('error', 'Failed to update item');
    }
  };

  const handleDeleteItem = (itemId: number) => {
    Alert.alert('Delete Item', 'Remove this bottom bar item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await bottomBarApi.deleteItem(themeId, itemId);
            setItems(prev => prev.filter(i => i.id !== itemId));
            showToast('success', 'Item removed');
          } catch {
            showToast('error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingOverlay fullScreen />;

  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Bottom Bar</Text>
        <Button title="+ Add" onPress={() => setShowAddForm(true)} size="sm" />
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        <View style={styles.previewBar}>
          {sortedItems.filter(i => i.is_active).map((item, index) => (
            <View key={item.id} style={styles.previewItem}>
              <View style={[styles.previewIcon, index === 0 && { backgroundColor: colors.primary }]} />
              <Text style={[styles.previewLabel, index === 0 && { color: colors.primary }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.sectionTitle}>NAVIGATION ITEMS</Text>

        {sortedItems.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            {editingItem?.id === item.id ? (
              <View style={styles.editForm}>
                <Input label="Label" value={editLabel} onChangeText={setEditLabel} />
                <Input label="Icon Name" value={editIcon} onChangeText={setEditIcon} />
                <View style={styles.editActions}>
                  <Button title="Cancel" onPress={() => setEditingItem(null)} variant="ghost" size="sm" />
                  <Button title="Save" onPress={handleUpdateItem} size="sm" />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.dragHandle}>
                  <Text style={styles.dragDots}>⠿</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemMeta}>
                    {item.Page?.title || `Page #${item.page_id}`} · {item.icon}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => {
                    setEditingItem(item);
                    setEditLabel(item.label);
                    setEditIcon(item.icon);
                  }}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                  <Text style={styles.deleteText}>X</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}

        {sortedItems.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No bottom bar items</Text>
            <Text style={styles.emptySubtext}>Add navigation items for your app</Text>
          </View>
        )}

        {/* Add form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>Add Navigation Item</Text>
            <Input label="Label" value={newLabel} onChangeText={setNewLabel} placeholder="e.g. Home" />
            <Input label="Icon Name" value={newIcon} onChangeText={setNewIcon} placeholder="e.g. home" />
            <Text style={styles.pageSelectLabel}>SELECT PAGE</Text>
            <View style={styles.pageGrid}>
              {pages.map(page => (
                <TouchableOpacity
                  key={page.id}
                  style={[styles.pageOption, newPageId === page.id && styles.pageOptionActive]}
                  onPress={() => setNewPageId(page.id)}>
                  <Text style={[styles.pageOptionText, newPageId === page.id && styles.pageOptionTextActive]} numberOfLines={1}>
                    {page.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.addFormActions}>
              <Button title="Cancel" onPress={() => setShowAddForm(false)} variant="ghost" />
              <Button title="Add Item" onPress={handleAddItem} disabled={!newLabel.trim() || !newPageId} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  headerTitle: { ...typography.h4, color: colors.text },
  previewContainer: { padding: spacing.lg, alignItems: 'center' },
  previewBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    width: 280, ...shadows.md,
  },
  previewItem: { flex: 1, alignItems: 'center', gap: 4 },
  previewIcon: {
    width: 22, height: 22, borderRadius: 4,
    backgroundColor: colors.textTertiary, opacity: 0.3,
  },
  previewLabel: { fontSize: 9, color: colors.textTertiary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  sectionTitle: {
    ...typography.captionMedium, color: colors.textTertiary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md,
  },
  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
  },
  dragHandle: { paddingRight: spacing.sm },
  dragDots: { fontSize: 16, color: colors.textTertiary },
  itemInfo: { flex: 1 },
  itemLabel: { ...typography.bodyMedium, color: colors.text },
  itemMeta: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  editBtn: { paddingHorizontal: spacing.sm },
  editText: { ...typography.captionMedium, color: colors.primary },
  deleteText: { ...typography.bodyMedium, color: colors.error, paddingHorizontal: spacing.sm },
  editForm: { flex: 1 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
  emptyState: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textSecondary },
  emptySubtext: { ...typography.caption, color: colors.textTertiary, marginTop: 4 },
  addForm: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginTop: spacing.md, ...shadows.sm,
  },
  addFormTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.lg },
  pageSelectLabel: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm,
  },
  pageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  pageOption: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
  },
  pageOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  pageOptionText: { ...typography.caption, color: colors.textSecondary },
  pageOptionTextActive: { color: colors.primary, fontWeight: '600' },
  addFormActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
