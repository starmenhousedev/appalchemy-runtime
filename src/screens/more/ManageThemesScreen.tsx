import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { publishApi, themesApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { Input } from '../../components/common/Input';
import type { ImportedTheme } from '../../types';

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
const defaultScheduleDate = () => {
  const d = new Date(Date.now() + 24 * 60 * 60_000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function ManageThemesScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [themes, setThemes] = useState<ImportedTheme[]>([]);
  const [buildCounts, setBuildCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const [renameTarget, setRenameTarget] = useState<ImportedTheme | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);

  const [scheduleTarget, setScheduleTarget] = useState<ImportedTheme | null>(null);
  const [scheduleDate, setScheduleDate] = useState(defaultScheduleDate());
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const fetchThemes = useCallback(async () => {
    try {
      const [themeData, buildsData] = await Promise.all([
        themesApi.listImported(),
        publishApi.listBuilds().catch(() => []),
      ]);
      setThemes(Array.isArray(themeData) ? themeData : []);
      setBuildCounts(
        Array.isArray(buildsData)
          ? buildsData.reduce<Record<number, number>>((counts, build) => {
              if (typeof build?.imported_theme_id === 'number') {
                counts[build.imported_theme_id] =
                  (counts[build.imported_theme_id] ?? 0) + 1;
              }
              return counts;
            }, {})
          : {},
      );
    } catch {
      showToast('error', 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const submitRename = async () => {
    if (!renameTarget) return;
    const next = renameValue.trim();
    if (!next) {
      showToast('error', 'Name is required');
      return;
    }
    setRenameSaving(true);
    try {
      await themesApi.renameImported(renameTarget.id, next);
      setThemes(prev => prev.map(t => (t.id === renameTarget.id ? { ...t, name: next } : t)));
      showToast('success', 'Theme renamed');
      setRenameTarget(null);
      setRenameValue('');
    } catch {
      showToast('error', 'Failed to rename theme');
    } finally {
      setRenameSaving(false);
    }
  };

  const submitSchedule = async () => {
    if (!scheduleTarget) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduleDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduleTime)) {
      showToast('error', 'Use YYYY-MM-DD and HH:MM');
      return;
    }
    const ts = new Date(`${scheduleDate}T${scheduleTime}:00`).getTime();
    if (Number.isNaN(ts) || ts <= Date.now()) {
      showToast('error', 'Schedule must be in the future');
      return;
    }
    setScheduleSaving(true);
    try {
      await themesApi.scheduleImported(scheduleTarget.id, new Date(ts).toISOString());
      showToast('success', 'Theme scheduled');
      setScheduleTarget(null);
      fetchThemes();
    } catch {
      showToast('error', 'Failed to schedule theme');
    } finally {
      setScheduleSaving(false);
    }
  };

  const openEditCode = (item: ImportedTheme) => {
    const parent = navigation.getParent ? navigation.getParent() : null;
    if (parent && typeof parent.navigate === 'function') {
      parent.navigate('Design', { screen: 'ThemeCode', params: { themeId: item.id } });
    } else {
      navigation.navigate('ThemeCode' as never, { themeId: item.id } as never);
    }
  };

  const handleEnable = async (id: number) => {
    try {
      await themesApi.enableImported(id);
      fetchThemes();
      showToast('success', 'Theme enabled');
    } catch {
      showToast('error', 'Failed to enable theme');
    }
  };

  const handleDisable = async (id: number) => {
    try {
      await themesApi.disableImported(id);
      fetchThemes();
      showToast('success', 'Theme disabled');
    } catch {
      showToast('error', 'Failed to disable theme');
    }
  };

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleViewDetails = async (item: ImportedTheme) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      // The starter theme catalog entry is loaded by id — surfaces metadata
      // (description, version, preview images) that isn't on the imported row.
      const data = await themesApi.getTheme(item.theme_id);
      setDetails((data as unknown as Record<string, unknown>) ?? null);
    } catch {
      showToast('error', 'Failed to load theme details');
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
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

  const handleDelete = (item: ImportedTheme) => {
    const buildCount = buildCounts[item.id] ?? 0;
    if (buildCount > 0) {
      Alert.alert(
        'Theme linked to builds',
        `"${item.name}" has ${buildCount} build${buildCount === 1 ? '' : 's'} in Publish and cannot be deleted until those build records are removed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Publish',
            onPress: () => navigation.navigate('Publish' as never),
          },
        ],
      );
      return;
    }

    Alert.alert('Delete Theme', `Delete "${item.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await themesApi.deleteImported(item.id);
            setThemes(prev => prev.filter(t => t.id !== item.id));
            showToast('success', 'Theme deleted');
          } catch (error: any) {
            const serverMessage =
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message;
            showToast(
              'error',
              serverMessage &&
                serverMessage !== 'Failed to delete imported theme'
                ? serverMessage
                : 'Failed to delete theme',
            );
            fetchThemes();
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.sm },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
        },
        cardHeader: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
        cardHeaderContent: { flex: 1, justifyContent: 'center' },
        thumbnail: { width: 64, height: 64, borderRadius: theme.borderRadius.md },
        thumbnailPlaceholder: {
          backgroundColor: theme.colors.primarySoft,
          justifyContent: 'center',
          alignItems: 'center',
        },
        thumbnailText: { ...theme.typography.h3, color: theme.colors.primary },
        themeName: { ...theme.typography.bodyMedium, color: theme.colors.text, marginBottom: theme.spacing.xs },
        badges: { flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' },
        actionsWrap: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
          paddingTop: theme.spacing.sm,
          gap: theme.spacing.lg,
          rowGap: theme.spacing.xs,
        },
        actionLink: { ...theme.typography.captionMedium, color: theme.colors.primary, paddingVertical: 4 },
        dangerLink: { ...theme.typography.captionMedium, color: theme.colors.error, paddingVertical: 4 },
        modalOverlay: {
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg,
        },
        modalCard: {
          width: '100%',
          maxWidth: 420,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          ...theme.shadows.lg,
        },
        modalTitle: { ...theme.typography.h4, color: theme.colors.text, marginBottom: theme.spacing.xs },
        modalSubtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
        modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.md },
        row: { flexDirection: 'row', gap: theme.spacing.md },
        half: { flex: 1 },
      }),
    [theme, insets.bottom],
  );

  const renderItem = ({ item }: { item: ImportedTheme }) => {
    const buildCount = buildCounts[item.id] ?? 0;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {item.Theme?.thumbnail ? (
            <Image source={{ uri: item.Theme.thumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Text style={styles.thumbnailText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.cardHeaderContent}>
            <Text style={styles.themeName}>{item.name}</Text>
            <View style={styles.badges}>
              {item.is_active ? <StatusBadge label="Active" tone="success" dot /> : null}
              {item.is_pinned ? <StatusBadge label="Pinned" tone="warning" /> : null}
              {item.scheduled_at ? <StatusBadge label="Scheduled" tone="info" /> : null}
              {buildCount > 0 ? (
                <StatusBadge
                  label={`${buildCount} build${buildCount === 1 ? '' : 's'}`}
                  tone="warning"
                />
              ) : null}
              {!item.is_active && !item.is_pinned && !item.scheduled_at && buildCount === 0 ? (
                <StatusBadge label="Imported" tone="neutral" />
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.actionsWrap}>
          {item.is_active ? (
            <TouchableOpacity onPress={() => handleDisable(item.id)}>
              <Text style={styles.actionLink}>Disable</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => handleEnable(item.id)}>
              <Text style={styles.actionLink}>Enable</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleViewDetails(item)}>
            <Text style={styles.actionLink}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setRenameTarget(item);
              setRenameValue(item.name);
            }}>
            <Text style={styles.actionLink}>Rename</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openEditCode(item)}>
            <Text style={styles.actionLink}>Edit code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setScheduleTarget(item);
              setScheduleDate(defaultScheduleDate());
              setScheduleTime('09:00');
            }}>
            <Text style={styles.actionLink}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePin(item.id)}>
            <Text style={styles.actionLink}>{item.is_pinned ? 'Unpin' : 'Pin'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDuplicate(item.id)}>
            <Text style={styles.actionLink}>Duplicate</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Text style={styles.dangerLink}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Manage Themes"
        subtitle={`${themes.length} imported`}
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <LoadingState message="Loading themes…" />
      ) : (
        <FlatList
          data={themes}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchThemes} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="◫"
              title="No themes imported"
              description="Import a theme from the Design section to get started."
            />
          }
        />
      )}

      <Modal visible={!!renameTarget} transparent animationType="fade" onRequestClose={() => setRenameTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rename theme</Text>
            <Input label="Name" value={renameValue} onChangeText={setRenameValue} placeholder="Theme name" />
            <View style={styles.modalActions}>
              <ActionButton label="Cancel" variant="ghost" onPress={() => setRenameTarget(null)} />
              <ActionButton label="Save" loading={renameSaving} onPress={submitRename} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={detailsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Theme details</Text>
            {detailsLoading ? (
              <Text style={styles.modalSubtitle}>Loading…</Text>
            ) : details ? (
              <>
                <Text style={[styles.modalSubtitle, { color: theme.colors.text }]}>
                  {(details.name as string) ?? '—'}
                </Text>
                {details.description ? (
                  <Text style={styles.modalSubtitle}>{String(details.description)}</Text>
                ) : null}
                <View style={{ gap: 4, marginTop: theme.spacing.xs }}>
                  {(['category', 'version', 'slug'] as const).map(k =>
                    details[k] ? (
                      <Text
                        key={k}
                        style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        {k}: {String(details[k])}
                      </Text>
                    ) : null,
                  )}
                </View>
              </>
            ) : (
              <Text style={styles.modalSubtitle}>No details available.</Text>
            )}
            <View style={styles.modalActions}>
              <ActionButton label="Close" variant="ghost" onPress={() => setDetailsOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!scheduleTarget} transparent animationType="fade" onRequestClose={() => setScheduleTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Schedule theme</Text>
            <Text style={styles.modalSubtitle}>Activate "{scheduleTarget?.name ?? ''}" at this time.</Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <Input
                  label="Date (YYYY-MM-DD)"
                  value={scheduleDate}
                  onChangeText={setScheduleDate}
                  placeholder="2026-12-31"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.half}>
                <Input
                  label="Time (HH:MM)"
                  value={scheduleTime}
                  onChangeText={setScheduleTime}
                  placeholder="14:30"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <ActionButton label="Cancel" variant="ghost" onPress={() => setScheduleTarget(null)} />
              <ActionButton label="Schedule" loading={scheduleSaving} onPress={submitSchedule} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
