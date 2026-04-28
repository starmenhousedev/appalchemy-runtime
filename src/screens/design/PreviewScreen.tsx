import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { previewApi, pagesApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { SectionCard } from '../../components/common/SectionCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { PreviewDevice, Page } from '../../types';

interface PreviewSnapshot {
  pages?: Array<{ id: number; title: string; type: string; sections?: unknown[] }>;
  sections?: Array<{ id: number; type: string; title?: string; config?: unknown }>;
  bottom_bar?: Array<unknown>;
  theme?: { id: number; name: string };
  page?: { id: number; title: string };
  rendered_html?: string;
  rendered_url?: string;
  [key: string]: unknown;
}

export function PreviewScreen({
  route,
  navigation,
}: {
  route: { params: { themeId: number; pageId?: number } };
  navigation: any;
}) {
  const { themeId, pageId: initialPageId } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [devices, setDevices] = useState<PreviewDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<PreviewDevice | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<number | null>(initialPageId ?? null);
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadShell = useCallback(async () => {
    try {
      const [deviceData, pageData] = await Promise.all([
        previewApi.getDevices().catch(() => [] as PreviewDevice[]),
        pagesApi.list(themeId).catch(() => [] as Page[]),
      ]);
      const deviceList = Array.isArray(deviceData) ? deviceData : [];
      setDevices(deviceList);
      if (deviceList.length > 0) {
        setSelectedDevice(prev => prev ?? deviceList[0]);
      }
      const pageList = Array.isArray(pageData) ? pageData : [];
      setPages(pageList);
      if (!initialPageId && pageList.length > 0) {
        setSelectedPageId(prev => prev ?? pageList[0].id);
      }
    } catch {
      showToast('error', 'Failed to load preview shell');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [themeId, initialPageId, showToast]);

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const data = selectedPageId
        ? await previewApi.getPagePreview(themeId, selectedPageId)
        : await previewApi.getThemePreview(themeId);
      setSnapshot((data as PreviewSnapshot) ?? {});
    } catch {
      showToast('error', 'Failed to load preview');
      setSnapshot(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [themeId, selectedPageId, showToast]);

  useEffect(() => {
    loadShell();
  }, [loadShell]);

  useEffect(() => {
    if (!loading) loadPreview();
  }, [loading, loadPreview]);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([loadShell(), loadPreview()]);
  };

  const sections = useMemo(() => {
    const fromSnapshot = snapshot?.sections;
    if (Array.isArray(fromSnapshot)) return fromSnapshot;
    const pageNode = (snapshot?.pages || []).find(p => p.id === selectedPageId);
    if (pageNode && Array.isArray(pageNode.sections)) {
      return pageNode.sections as Array<{ id: number; type: string; title?: string }>;
    }
    return [];
  }, [snapshot, selectedPageId]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: {
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxxl + insets.bottom,
          gap: theme.spacing.md,
        },
        deviceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
        chip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 8,
          borderRadius: theme.borderRadius.round,
          borderWidth: 1.5,
          borderColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surfaceSecondary,
        },
        chipActive: {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primarySoft,
        },
        chipText: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        chipTextActive: { color: theme.colors.primary },
        deviceMeta: {
          ...theme.typography.small,
          color: theme.colors.textTertiary,
          marginTop: theme.spacing.xs,
        },
        frame: {
          alignSelf: 'center',
          backgroundColor: '#1c1c1e',
          padding: 10,
          borderRadius: 32,
          ...theme.shadows.lg,
        },
        screen: {
          backgroundColor: theme.colors.background,
          borderRadius: 22,
          overflow: 'hidden',
        },
        sectionTile: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.divider,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        sectionType: {
          ...theme.typography.captionMedium,
          color: theme.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
        sectionTitle: {
          ...theme.typography.caption,
          color: theme.colors.text,
          marginTop: 2,
        },
        emptyFrame: {
          padding: theme.spacing.xxl,
          alignItems: 'center',
          justifyContent: 'center',
        },
        statusRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
        },
      }),
    [theme, insets.bottom],
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title="Live Preview" onBack={() => navigation.goBack()} />
        <LoadingState message="Loading preview…" />
      </View>
    );
  }

  const screenWidth = selectedDevice ? Math.min(280, selectedDevice.width / 2) : 260;
  const screenHeight = selectedDevice ? screenWidth * (selectedDevice.height / selectedDevice.width) : 520;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Live Preview"
        subtitle={selectedDevice ? `${selectedDevice.brand} ${selectedDevice.model}` : undefined}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }>
        <SectionCard title="Device" subtitle={`${devices.length} available`}>
          {devices.length === 0 ? (
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              No preview devices available.
            </Text>
          ) : (
            <>
              <View style={styles.deviceRow}>
                {devices.map(d => {
                  const active = selectedDevice?.id === d.id;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      onPress={() => setSelectedDevice(d)}
                      style={[styles.chip, active && styles.chipActive]}
                      activeOpacity={0.85}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {d.model}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {selectedDevice ? (
                <Text style={styles.deviceMeta}>
                  {selectedDevice.width}×{selectedDevice.height}
                  {selectedDevice.has_notch ? ' · notched' : ''}
                </Text>
              ) : null}
            </>
          )}
        </SectionCard>

        {pages.length > 0 ? (
          <SectionCard title="Page" subtitle="Choose what to render">
            <View style={styles.deviceRow}>
              <TouchableOpacity
                onPress={() => setSelectedPageId(null)}
                style={[styles.chip, selectedPageId === null && styles.chipActive]}
                activeOpacity={0.85}>
                <Text
                  style={[
                    styles.chipText,
                    selectedPageId === null && styles.chipTextActive,
                  ]}>
                  Whole theme
                </Text>
              </TouchableOpacity>
              {pages.map(p => {
                const active = selectedPageId === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPageId(p.id)}
                    style={[styles.chip, active && styles.chipActive]}
                    activeOpacity={0.85}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {p.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>
        ) : null}

        <SectionCard
          title="Preview"
          subtitle={previewLoading ? 'Rendering…' : snapshot ? 'Live snapshot' : 'No preview'}
          padded={false}>
          <View style={styles.statusRow}>
            <View style={{ paddingLeft: theme.spacing.lg }}>
              <StatusBadge
                label={snapshot?.rendered_url ? 'Rendered' : snapshot ? 'Snapshot' : 'No data'}
                tone={snapshot ? 'success' : 'neutral'}
                dot
              />
            </View>
          </View>
          <View style={{ padding: theme.spacing.md }}>
            <View
              style={[
                styles.frame,
                { width: screenWidth + 20, height: screenHeight + 20 },
              ]}>
              <View style={[styles.screen, { width: screenWidth, height: screenHeight }]}>
                {previewLoading ? (
                  <LoadingState message="Rendering…" />
                ) : sections.length === 0 ? (
                  <View style={styles.emptyFrame}>
                    <EmptyState
                      icon="◈"
                      title="Empty preview"
                      description={
                        snapshot
                          ? 'No sections in this view.'
                          : 'No preview data returned by the API.'
                      }
                      compact
                    />
                  </View>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {sections.map((section, idx) => (
                      <View
                        key={(section as any).id ?? idx}
                        style={styles.sectionTile}>
                        <Text style={styles.sectionType}>
                          {(section as any).type ?? 'section'}
                        </Text>
                        <Text style={styles.sectionTitle} numberOfLines={1}>
                          {(section as any).title ?? '—'}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </View>
        </SectionCard>
      </ScrollView>
    </View>
  );
}
