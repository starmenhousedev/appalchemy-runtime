import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { publishApi, themesApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SectionCard } from '../../components/common/SectionCard';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Input } from '../../components/common/Input';
import type { Build, PublishStatus, ImportedTheme, BuildPlatform } from '../../types';
import type { StatusTone } from '../../components/common/StatusBadge';

const STATUS_TONE: Record<string, StatusTone> = {
  queued: 'warning',
  building: 'info',
  completed: 'success',
  failed: 'error',
};

export function PublishScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [themes, setThemes] = useState<ImportedTheme[]>([]);

  const [showBuildForm, setShowBuildForm] = useState(false);
  const [buildThemeId, setBuildThemeId] = useState<number | null>(null);
  const [buildPlatform, setBuildPlatform] = useState<BuildPlatform>('both');
  const [buildVersion, setBuildVersion] = useState('1.0.0');
  const [building, setBuilding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [buildsData, statusData, themesData] = await Promise.all([
        publishApi.listBuilds().catch(() => []),
        publishApi.getPublishStatus().catch(() => null),
        themesApi.listImported().catch(() => []),
      ]);
      setBuilds(Array.isArray(buildsData) ? buildsData : []);
      setPublishStatus(statusData ?? null);
      setThemes(Array.isArray(themesData) ? themesData : []);
    } catch {
      showToast('error', 'Failed to load publish data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlightIds = useMemo(
    () =>
      builds
        .filter(b => b.status === 'queued' || b.status === 'building')
        .map(b => b.id),
    [builds],
  );

  useEffect(() => {
    if (inFlightIds.length === 0) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;
    const tick = async () => {
      try {
        const updates = await Promise.all(
          inFlightIds.map(id =>
            publishApi.getBuildStatus(id).catch(() => null),
          ),
        );
        const valid = updates.filter((b): b is Build => !!b);
        if (valid.length === 0) return;
        setBuilds(prev =>
          prev.map(b => valid.find(v => v.id === b.id) ?? b),
        );
        const stillInFlight = valid.some(
          v => v.status === 'queued' || v.status === 'building',
        );
        if (!stillInFlight) {
          // Build finished — refresh full lists once so PublishStatus is current.
          fetchData();
        }
      } catch {
        // tolerate transient errors
      }
    };
    tick();
    pollRef.current = setInterval(tick, 8_000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [inFlightIds, fetchData]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const openUrl = (url?: string | null) => {
    if (!url) return;
    Linking.openURL(url).catch(() => showToast('error', 'Failed to open link'));
  };

  const [downloading, setDownloading] = useState<number | null>(null);
  const handleDownload = async (build: Build) => {
    // Prefer direct URLs, but fall back to the on-demand signed URL endpoint
    // so the user always has a way to grab the artifact.
    const direct = build.apk_url || build.aab_url || build.ipa_url;
    if (direct) {
      openUrl(direct);
      return;
    }
    setDownloading(build.id);
    try {
      const result = await publishApi.downloadBuild(build.id);
      const url = result?.url;
      if (!url) {
        showToast('error', 'Download not available yet');
        return;
      }
      openUrl(url);
    } catch {
      showToast('error', 'Failed to fetch download link');
    } finally {
      setDownloading(null);
    }
  };

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.md },
        storeRow: { flexDirection: 'row', gap: theme.spacing.md },
        storeCard: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          alignItems: 'center',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
        },
        storeIcon: {
          width: 44,
          height: 44,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.sm,
        },
        storeIconText: { ...theme.typography.h3, color: theme.colors.primary },
        storeName: { ...theme.typography.bodyMedium, color: theme.colors.text },
        storeStatus: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          marginTop: 2,
          textTransform: 'capitalize',
        },
        formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
        chip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 8,
          borderRadius: theme.borderRadius.round,
          borderWidth: 1.5,
          borderColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surfaceSecondary,
        },
        chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
        chipText: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        chipTextActive: { color: theme.colors.primary },
        platformRow: { flexDirection: 'row', gap: theme.spacing.sm },
        platformBtn: {
          flex: 1,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1.5,
          borderColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surfaceSecondary,
          alignItems: 'center',
        },
        platformBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
        platformBtnText: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        platformBtnTextActive: { color: theme.colors.primary },
        fieldLabel: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.xs,
        },
        formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
        buildCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
        },
        buildHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        buildVersion: { ...theme.typography.bodyMedium, color: theme.colors.text },
        buildPlatform: { ...theme.typography.small, color: theme.colors.textTertiary, textTransform: 'capitalize', marginTop: 2 },
        buildDate: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: theme.spacing.sm },
        downloadRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          marginTop: theme.spacing.md,
        },
        downloadBtn: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs + 2,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primarySoft,
        },
        downloadBtnText: { ...theme.typography.captionMedium, color: theme.colors.primary },
        submitRow: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
        },
        submitText: { ...theme.typography.captionMedium, color: theme.colors.primary, paddingVertical: 4 },
        errorLog: {
          ...theme.typography.small,
          color: theme.colors.error,
          marginTop: theme.spacing.sm,
          backgroundColor: theme.colors.errorLight,
          padding: theme.spacing.sm,
          borderRadius: theme.borderRadius.sm,
        },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Publish"
        onBack={() => navigation.goBack()}
        right={
          <ActionButton label="+ Build" size="sm" onPress={() => setShowBuildForm(s => !s)} />
        }
      />
      {loading ? (
        <LoadingState message="Loading builds…" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }>
          {publishStatus && (
            <View style={styles.storeRow}>
              <View style={styles.storeCard}>
                <View style={styles.storeIcon}>
                  <Text style={styles.storeIconText}>▶</Text>
                </View>
                <Text style={styles.storeName}>Play Store</Text>
                <Text style={styles.storeStatus}>{publishStatus.play_store_status || 'Not published'}</Text>
              </View>
              <View style={styles.storeCard}>
                <View style={styles.storeIcon}>
                  <Text style={styles.storeIconText}>◉</Text>
                </View>
                <Text style={styles.storeName}>App Store</Text>
                <Text style={styles.storeStatus}>{publishStatus.app_store_status || 'Not published'}</Text>
              </View>
            </View>
          )}

          {showBuildForm && (
            <SectionCard title="New Build">
              <Text style={styles.fieldLabel}>Theme</Text>
              <View style={[styles.formGrid, { marginBottom: theme.spacing.md }]}>
                {themes.length === 0 ? (
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                    Import a theme first.
                  </Text>
                ) : (
                  themes.map(t => {
                    const active = buildThemeId === t.id;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setBuildThemeId(t.id)}
                        activeOpacity={0.8}>
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.name}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <Text style={styles.fieldLabel}>Platform</Text>
              <View style={[styles.platformRow, { marginBottom: theme.spacing.md }]}>
                {(['android', 'ios', 'both'] as BuildPlatform[]).map(p => {
                  const active = buildPlatform === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.platformBtn, active && styles.platformBtnActive]}
                      onPress={() => setBuildPlatform(p)}
                      activeOpacity={0.8}>
                      <Text style={[styles.platformBtnText, active && styles.platformBtnTextActive]}>
                        {p === 'both' ? 'Both' : p === 'android' ? 'Android' : 'iOS'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input label="Version" value={buildVersion} onChangeText={setBuildVersion} placeholder="1.0.0" />

              <View style={styles.formActions}>
                <ActionButton label="Cancel" variant="ghost" size="sm" onPress={() => setShowBuildForm(false)} />
                <ActionButton label="Start build" size="sm" loading={building} onPress={handleBuild} />
              </View>
            </SectionCard>
          )}

          <SectionCard title="Builds" subtitle={`${builds.length} total`} padded={false}>
            <View style={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
              {builds.length === 0 ? (
                <EmptyState
                  icon="↑"
                  title="No builds yet"
                  description="Create your first build to publish your app."
                  actionLabel="Start a build"
                  onAction={() => setShowBuildForm(true)}
                  compact
                />
              ) : (
                builds.map(build => {
                  const tone: StatusTone = STATUS_TONE[build.status] ?? 'neutral';
                  return (
                    <View key={build.id} style={styles.buildCard}>
                      <View style={styles.buildHeader}>
                        <View>
                          <Text style={styles.buildVersion}>
                            v{build.version} ({build.build_number})
                          </Text>
                          <Text style={styles.buildPlatform}>{build.platform}</Text>
                        </View>
                        <StatusBadge label={build.status} tone={tone} dot />
                      </View>
                      <Text style={styles.buildDate}>
                        {new Date(build.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {build.status === 'completed' && (
                        <>
                          <View style={styles.downloadRow}>
                            {!!build.aab_url && (
                              <TouchableOpacity style={styles.downloadBtn} onPress={() => openUrl(build.aab_url)}>
                                <Text style={styles.downloadBtnText}>Open AAB</Text>
                              </TouchableOpacity>
                            )}
                            {!!build.apk_url && (
                              <TouchableOpacity style={styles.downloadBtn} onPress={() => openUrl(build.apk_url)}>
                                <Text style={styles.downloadBtnText}>Open APK</Text>
                              </TouchableOpacity>
                            )}
                            {!!build.ipa_url && (
                              <TouchableOpacity style={styles.downloadBtn} onPress={() => openUrl(build.ipa_url)}>
                                <Text style={styles.downloadBtnText}>Open IPA</Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={[styles.downloadBtn, downloading === build.id && { opacity: 0.6 }]}
                              onPress={() => handleDownload(build)}
                              disabled={downloading === build.id}>
                              <Text style={styles.downloadBtnText}>
                                {downloading === build.id ? 'Fetching…' : 'Get download link'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.submitRow}>
                            {(build.platform === 'android' || build.platform === 'both') && (
                              <TouchableOpacity onPress={() => handleSubmit(build.id, 'play')}>
                                <Text style={styles.submitText}>Submit to Play Store</Text>
                              </TouchableOpacity>
                            )}
                            {(build.platform === 'ios' || build.platform === 'both') && (
                              <TouchableOpacity onPress={() => handleSubmit(build.id, 'app')}>
                                <Text style={styles.submitText}>Submit to App Store</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </>
                      )}
                      {build.status === 'failed' && build.error_log ? (
                        <Text style={styles.errorLog} numberOfLines={3}>
                          {build.error_log}
                        </Text>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          </SectionCard>
        </ScrollView>
      )}
    </View>
  );
}
