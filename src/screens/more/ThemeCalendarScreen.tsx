import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { Input } from '../../components/common/Input';
import type { ThemeCalendarEntry, ImportedTheme } from '../../types';
import type { StatusTone } from '../../components/common/StatusBadge';

const STATUS_TONE: Record<string, StatusTone> = {
  scheduled: 'info',
  active: 'success',
  completed: 'neutral',
  cancelled: 'error',
};

export function ThemeCalendarScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [entries, setEntries] = useState<ThemeCalendarEntry[]>([]);
  const [themes, setThemes] = useState<ImportedTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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
      setEntries(Array.isArray(entryData) ? entryData : []);
      setThemes(Array.isArray(themeData) ? themeData : []);
    } catch {
      showToast('error', 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormTitle('');
    setFormThemeId(null);
    setFormActivateAt('');
    setFormDeactivateAt('');
    setEditingId(null);
  };

  const beginEdit = (entry: ThemeCalendarEntry) => {
    setEditingId(entry.id);
    setFormTitle(entry.title);
    setFormThemeId(entry.imported_theme_id);
    setFormActivateAt(entry.activate_at);
    setFormDeactivateAt(entry.deactivate_at ?? '');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formThemeId || !formActivateAt) {
      showToast('error', 'Title, theme, and activation date are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId !== null) {
        const updated = await themeCalendarApi.update(editingId, {
          title: formTitle.trim(),
          imported_theme_id: formThemeId,
          activate_at: formActivateAt,
          deactivate_at: formDeactivateAt || undefined,
        });
        setEntries(prev => prev.map(e => (e.id === editingId ? updated : e)));
        showToast('success', 'Schedule updated');
      } else {
        await themeCalendarApi.create({
          imported_theme_id: formThemeId,
          title: formTitle.trim(),
          activate_at: formActivateAt,
          deactivate_at: formDeactivateAt || '',
        });
        showToast('success', 'Schedule created');
        fetchData();
      }
      setShowForm(false);
      resetForm();
    } catch {
      showToast('error', `Failed to ${editingId !== null ? 'update' : 'create'} schedule`);
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.sm },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.shadows.sm,
        },
        cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
        entryTitle: { ...theme.typography.bodyMedium, color: theme.colors.text },
        themeName: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
        dateRow: { flexDirection: 'row', gap: theme.spacing.xl, flexWrap: 'wrap' },
        dateLabel: { ...theme.typography.small, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.3 },
        dateValue: { ...theme.typography.caption, color: theme.colors.text, marginTop: 2 },
        deleteText: { ...theme.typography.captionMedium, color: theme.colors.error, marginTop: theme.spacing.md, alignSelf: 'flex-start' },
        modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
        modalContent: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.borderRadius.xl,
          borderTopRightRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          paddingBottom: theme.spacing.xl + insets.bottom,
          maxHeight: '85%',
        },
        modalTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.lg },
        fieldLabel: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.xs,
        },
        themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
        themeChip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1.5,
          borderColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surfaceSecondary,
        },
        themeChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
        themeChipText: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        themeChipTextActive: { color: theme.colors.primary },
        modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.lg },
      }),
    [theme, insets.bottom],
  );

  const renderItem = ({ item }: { item: ThemeCalendarEntry }) => {
    const tone: StatusTone = STATUS_TONE[item.status] ?? 'neutral';
    const themeName = item.ImportedTheme?.name || `Theme #${item.imported_theme_id}`;
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.entryTitle}>{item.title}</Text>
            <Text style={styles.themeName}>{themeName}</Text>
          </View>
          <StatusBadge label={item.status} tone={tone} dot />
        </View>
        <View style={styles.dateRow}>
          <View>
            <Text style={styles.dateLabel}>Activate</Text>
            <Text style={styles.dateValue}>{formatDate(item.activate_at)}</Text>
          </View>
          {item.deactivate_at ? (
            <View>
              <Text style={styles.dateLabel}>Deactivate</Text>
              <Text style={styles.dateValue}>{formatDate(item.deactivate_at)}</Text>
            </View>
          ) : null}
        </View>
        {item.status === 'scheduled' ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
            <TouchableOpacity onPress={() => beginEdit(item)}>
              <Text style={[styles.deleteText, { color: theme.colors.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Theme Calendar"
        subtitle={`${entries.length} scheduled`}
        onBack={() => navigation.goBack()}
        right={<ActionButton label="+ New" size="sm" onPress={() => setShowForm(true)} />}
      />
      {loading ? (
        <LoadingState message="Loading calendar…" />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="◔"
              title="No scheduled themes"
              description="Schedule theme changes for promotions, seasons, or special events."
              actionLabel="Schedule a theme"
              onAction={() => setShowForm(true)}
            />
          }
        />
      )}

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId !== null ? 'Edit Schedule' : 'Schedule Theme'}
            </Text>
            <Input label="Title" value={formTitle} onChangeText={setFormTitle} placeholder="e.g. Black Friday Theme" />
            <Text style={styles.fieldLabel}>Select theme</Text>
            <View style={styles.themeGrid}>
              {themes.map(t => {
                const active = formThemeId === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.themeChip, active && styles.themeChipActive]}
                    onPress={() => setFormThemeId(t.id)}
                    activeOpacity={0.8}>
                    <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>{t.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Input
              label="Activate at (YYYY-MM-DD HH:MM)"
              value={formActivateAt}
              onChangeText={setFormActivateAt}
              placeholder="2026-04-01 00:00"
            />
            <Input
              label="Deactivate at (optional)"
              value={formDeactivateAt}
              onChangeText={setFormDeactivateAt}
              placeholder="2026-04-08 00:00"
            />
            <View style={styles.modalActions}>
              <ActionButton
                label="Cancel"
                variant="ghost"
                onPress={() => {
                  setShowForm(false);
                  resetForm();
                }}
              />
              <ActionButton
                label={editingId !== null ? 'Save' : 'Create'}
                loading={saving}
                onPress={handleSave}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
