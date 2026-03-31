import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { publishApi, themesApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import type { Build, PublishStatus, ImportedTheme, BuildPlatform } from '../../types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  queued: { bg: colors.warning + '20', text: colors.warning },
  building: { bg: colors.info + '20', text: colors.info },
  completed: { bg: colors.successLight, text: colors.success },
  failed: { bg: colors.error + '15', text: colors.error },
};

export function PublishScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [themes, setThemes] = useState<ImportedTheme[]>([]);

  // Build form
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [buildThemeId, setBuildThemeId] = useState<number | null>(null);
  const [buildPlatform, setBuildPlatform] = useState<BuildPlatform>('both');
  const [buildVersion, setBuildVersion] = useState('1.0.0');
  const [building, setBuilding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [buildsData, statusData, themesData] = await Promise.all([
        publishApi.listBuilds(),
        publishApi.getPublishStatus().catch(() => null),
        themesApi.listImported(),
      ]);
      setBuilds(buildsData);
      setPublishStatus(statusData);
      setThemes(themesData);
    } catch {
      showToast('error', 'Failed to load publish data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBuild = async () => {
    if (!buildThemeId) {
      showToast('error', 'Select a theme to build');
      return;
    }
    setBuilding(true);
    try {
      await publishApi.build({
        imported_theme_id: buildThemeId,
        platform: buildPlatform,
        version: buildVersion.trim(),
      });
      setShowBuildForm(false);
      fetchData();
      showToast('success', 'Build started');
    } catch {
      showToast('error', 'Failed to start build');
    } finally {
      setBuilding(false);
    }
  };

  const handleSubmit = (buildId: number, store: 'play' | 'app') => {
    Alert.alert(
      `Submit to ${store === 'play' ? 'Play Store' : 'App Store'}`,
      'This will submit the build for review.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              if (store === 'play') {
                await publishApi.submitPlayStore(buildId);
              } else {
                await publishApi.submitAppStore(buildId);
              }
              fetchData();
              showToast('success', 'Submitted for review');
            } catch {
              showToast('error', 'Failed to submit');
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingOverlay fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Publish</Text>
        <Button title="+ Build" onPress={() => setShowBuildForm(true)} size="sm" />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[colors.primary]} />}>

        {/* Store Status */}
        {publishStatus && (
          <View style={styles.storeStatusRow}>
            <View style={styles.storeCard}>
              <Text style={styles.storeIcon}>A</Text>
              <Text style={styles.storeName}>Play Store</Text>
              <Text style={styles.storeStatus}>
                {publishStatus.play_store_status || 'Not published'}
              </Text>
            </View>
            <View style={styles.storeCard}>
              <Text style={styles.storeIcon}>A</Text>
              <Text style={styles.storeName}>App Store</Text>
              <Text style={styles.storeStatus}>
                {publishStatus.app_store_status || 'Not published'}
              </Text>
            </View>
          </View>
        )}

        {/* Build Form */}
        {showBuildForm && (
          <View style={styles.buildFormCard}>
            <Text style={styles.formTitle}>New Build</Text>

            <Text style={styles.fieldLabel}>THEME</Text>
            <View style={styles.themeGrid}>
              {themes.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.themeChip, buildThemeId === t.id && styles.themeChipActive]}
                  onPress={() => setBuildThemeId(t.id)}>
                  <Text style={[styles.themeChipText, buildThemeId === t.id && styles.themeChipTextActive]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>PLATFORM</Text>
            <View style={styles.platformRow}>
              {(['android', 'ios', 'both'] as BuildPlatform[]).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.platformBtn, buildPlatform === p && styles.platformBtnActive]}
                  onPress={() => setBuildPlatform(p)}>
                  <Text style={[styles.platformBtnText, buildPlatform === p && styles.platformBtnTextActive]}>
                    {p === 'both' ? 'Both' : p === 'android' ? 'Android' : 'iOS'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Version" value={buildVersion} onChangeText={setBuildVersion} placeholder="1.0.0" />

            <View style={styles.formActions}>
              <Button title="Cancel" onPress={() => setShowBuildForm(false)} variant="ghost" size="sm" />
              <Button title="Start Build" onPress={handleBuild} size="sm" loading={building} />
            </View>
          </View>
        )}

        {/* Builds List */}
        <Text style={styles.sectionTitle}>BUILDS</Text>
        {builds.map(build => {
          const statusColor = STATUS_COLORS[build.status] || STATUS_COLORS.queued;

          return (
            <View key={build.id} style={styles.buildCard}>
              <View style={styles.buildHeader}>
                <View>
                  <Text style={styles.buildVersion}>v{build.version} ({build.build_number})</Text>
                  <Text style={styles.buildPlatform}>{build.platform}</Text>
                </View>
                <View style={[styles.buildStatusBadge, { backgroundColor: statusColor.bg }]}>
                  <Text style={[styles.buildStatusText, { color: statusColor.text }]}>
                    {build.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.buildDate}>
                {new Date(build.createdAt).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </Text>
              {build.status === 'completed' && (
                <View style={styles.buildActions}>
                  {(build.platform === 'android' || build.platform === 'both') && (
                    <TouchableOpacity onPress={() => handleSubmit(build.id, 'play')} style={styles.submitBtn}>
                      <Text style={styles.submitBtnText}>Submit to Play Store</Text>
                    </TouchableOpacity>
                  )}
                  {(build.platform === 'ios' || build.platform === 'both') && (
                    <TouchableOpacity onPress={() => handleSubmit(build.id, 'app')} style={styles.submitBtn}>
                      <Text style={styles.submitBtnText}>Submit to App Store</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {build.status === 'failed' && build.error_log && (
                <Text style={styles.errorLog} numberOfLines={3}>{build.error_log}</Text>
              )}
            </View>
          );
        })}

        {builds.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No builds yet</Text>
            <Text style={styles.emptySubtitle}>Create your first build to publish your app.</Text>
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  storeStatusRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  storeCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, alignItems: 'center', ...shadows.sm,
  },
  storeIcon: { ...typography.h3, color: colors.primary, marginBottom: spacing.xs },
  storeName: { ...typography.captionMedium, color: colors.text },
  storeStatus: { ...typography.small, color: colors.textTertiary, marginTop: 2, textTransform: 'capitalize' },
  buildFormCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg, ...shadows.md,
    borderWidth: 1.5, borderColor: colors.primary + '30',
  },
  formTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.lg },
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
  platformRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  platformBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  platformBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  platformBtnText: { ...typography.captionMedium, color: colors.textSecondary },
  platformBtnTextActive: { color: colors.primary },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  sectionTitle: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md, marginTop: spacing.md,
  },
  buildCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  buildHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  buildVersion: { ...typography.bodyMedium, color: colors.text },
  buildPlatform: { ...typography.small, color: colors.textTertiary, textTransform: 'capitalize', marginTop: 1 },
  buildStatusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  buildStatusText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize' },
  buildDate: { ...typography.small, color: colors.textTertiary, marginTop: spacing.sm },
  buildActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  submitBtn: { paddingVertical: spacing.xs },
  submitBtnText: { ...typography.captionMedium, color: colors.primary },
  errorLog: { ...typography.small, color: colors.error, marginTop: spacing.sm, backgroundColor: colors.error + '08', padding: spacing.sm, borderRadius: borderRadius.sm },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
