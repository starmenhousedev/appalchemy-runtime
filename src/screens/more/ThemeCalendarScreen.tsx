import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themeCalendarApi, themesApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { ThemeCalendarEntry, ImportedTheme } from '../../types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: colors.info + '20', text: colors.info },
  active: { bg: colors.successLight, text: colors.success },
  completed: { bg: colors.surfaceSecondary, text: colors.textTertiary },
  cancelled: { bg: colors.error + '15', text: colors.error },
};

export function ThemeCalendarScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [entries, setEntries] = useState<ThemeCalendarEntry[]>([]);
  const [themes, setThemes] = useState<ImportedTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formThemeId, setFormThemeId] = useState<number | null>(null);
  const [formActivateAt, setFormActivateAt] = useState('');
  const [formDeactivateAt, setFormDeactivateAt] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [entryData, themeData] = await Promise.all([
        themeCalendarApi.list(),
        themesApi.listImported(),
      ]);
      setEntries(entryData);
      setThemes(themeData);
    } catch {
      showToast('error', 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formThemeId || !formActivateAt) {
      showToast('error', 'Title, theme, and activation date are required');
      return;
    }
    setSaving(true);
    try {
      await themeCalendarApi.create({
        imported_theme_id: formThemeId,
        title: formTitle.trim(),
        activate_at: formActivateAt,
        deactivate_at: formDeactivateAt || '',
      });
      setShowForm(false);
      resetForm();
      fetchData();
      showToast('success', 'Schedule created');
    } catch {
      showToast('error', 'Failed to create schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Schedule', 'Remove this scheduled theme change?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await themeCalendarApi.delete(id);
            setEntries(prev => prev.filter(e => e.id !== id));
            showToast('success', 'Schedule deleted');
          } catch {
            showToast('error', 'Failed to delete schedule');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormThemeId(null);
    setFormActivateAt('');
    setFormDeactivateAt('');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: ThemeCalendarEntry }) => {
    const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.scheduled;
    const themeName = item.ImportedTheme?.name || `Theme #${item.imported_theme_id}`;

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.cardInfo}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            <Text style={styles.themeName}>{themeName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Activate</Text>
            <Text style={styles.dateValue}>{formatDate(item.activate_at)}</Text>
          </View>
          {item.deactivate_at && (
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Deactivate</Text>
              <Text style={styles.dateValue}>{formatDate(item.deactivate_at)}</Text>
            </View>
          )}
        </View>
        {(item.status === 'scheduled') && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Theme Calendar</Text>
        <Button title="+ New" onPress={() => setShowForm(true)} size="sm" />
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No scheduled themes</Text>
              <Text style={styles.emptySubtitle}>
                Schedule theme changes for promotions, seasons, or special events.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Create Form Modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Theme</Text>

            <Input label="Title" value={formTitle} onChangeText={setFormTitle} placeholder="e.g. Black Friday Theme" />

            <Text style={styles.fieldLabel}>SELECT THEME</Text>
            <View style={styles.themeGrid}>
              {themes.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.themeChip, formThemeId === t.id && styles.themeChipActive]}
                  onPress={() => setFormThemeId(t.id)}>
                  <Text style={[styles.themeChipText, formThemeId === t.id && styles.themeChipTextActive]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Activate At (YYYY-MM-DD HH:MM)"
              value={formActivateAt}
              onChangeText={setFormActivateAt}
              placeholder="2026-04-01 00:00"
            />
            <Input
              label="Deactivate At (optional)"
              value={formDeactivateAt}
              onChangeText={setFormDeactivateAt}
              placeholder="2026-04-08 00:00"
            />

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => { setShowForm(false); resetForm(); }} variant="ghost" />
              <Button title="Create" onPress={handleCreate} loading={saving} />
            </View>
          </View>
        </View>
      </Modal>
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
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  cardInfo: { flex: 1 },
  entryTitle: { ...typography.bodyMedium, color: colors.text },
  themeName: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  statusText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize' },
  dateRow: { flexDirection: 'row', gap: spacing.xl },
  dateBlock: {},
  dateLabel: { ...typography.small, color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.3 },
  dateValue: { ...typography.caption, color: colors.text, marginTop: 2 },
  deleteBtn: { marginTop: spacing.md, alignSelf: 'flex-start' },
  deleteBtnText: { ...typography.captionMedium, color: colors.error },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  modalOverlay: {
    flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl, padding: spacing.xl,
    maxHeight: '85%',
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  fieldLabel: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs,
  },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  themeChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
  },
  themeChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  themeChipText: { ...typography.captionMedium, color: colors.textSecondary },
  themeChipTextActive: { color: colors.primary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.lg },
});
