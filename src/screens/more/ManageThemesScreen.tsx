import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themesApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import type { ImportedTheme } from '../../types';

export function ManageThemesScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [themes, setThemes] = useState<ImportedTheme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThemes = useCallback(async () => {
    try {
      const data = await themesApi.listImported();
      setThemes(data);
    } catch {
      showToast('error', 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const handleEnable = async (id: number) => {
    try {
      await themesApi.enableImported(id);
      fetchThemes();
      showToast('success', 'Theme enabled');
    } catch {
      showToast('error', 'Failed to enable theme');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await themesApi.duplicateImported(id);
      fetchThemes();
      showToast('success', 'Theme duplicated');
    } catch {
      showToast('error', 'Failed to duplicate theme');
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Delete Theme', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await themesApi.deleteImported(id);
            setThemes(prev => prev.filter(t => t.id !== id));
            showToast('success', 'Theme deleted');
          } catch {
            showToast('error', 'Failed to delete theme');
          }
        },
      },
    ]);
  };

  const handlePin = async (id: number) => {
    try {
      await themesApi.pinImported(id);
      fetchThemes();
    } catch {
      showToast('error', 'Failed to pin theme');
    }
  };

  const renderItem = ({ item }: { item: ImportedTheme }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.Theme?.thumbnail ? (
          <Image source={{ uri: item.Theme.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text style={styles.thumbnailText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.themeName}>{item.name}</Text>
          <View style={styles.badges}>
            {item.is_active && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
            {item.is_pinned && (
              <View style={styles.pinnedBadge}>
                <Text style={styles.pinnedBadgeText}>Pinned</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        {!item.is_active && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleEnable(item.id)}>
            <Text style={styles.actionText}>Enable</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={() => handlePin(item.id)}>
          <Text style={styles.actionText}>{item.is_pinned ? 'Unpin' : 'Pin'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDuplicate(item.id)}>
          <Text style={styles.actionText}>Duplicate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id, item.name)}>
          <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Manage Themes</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={themes}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchThemes} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No themes imported</Text>
              <Text style={styles.emptySubtitle}>Import a theme from the Design section to get started.</Text>
            </View>
          ) : null
        }
      />
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
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  cardHeader: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  thumbnail: { width: 64, height: 64, borderRadius: borderRadius.md },
  thumbnailPlaceholder: {
    backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center',
  },
  thumbnailText: { ...typography.h3, color: colors.primary },
  cardInfo: { flex: 1, justifyContent: 'center' },
  themeName: { ...typography.bodyMedium, color: colors.text, marginBottom: spacing.xs },
  badges: { flexDirection: 'row', gap: spacing.sm },
  activeBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.sm, backgroundColor: colors.successLight,
  },
  activeBadgeText: { ...typography.small, color: colors.success, fontWeight: '600' },
  pinnedBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.sm, backgroundColor: colors.warning + '20',
  },
  pinnedBadgeText: { ...typography.small, color: colors.warning, fontWeight: '600' },
  cardActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.borderLight,
    paddingTop: spacing.sm, gap: spacing.lg,
  },
  actionBtn: { paddingVertical: spacing.xs },
  actionText: { ...typography.captionMedium, color: colors.primary },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
