import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themesApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { Theme as StarterTheme, ImportedTheme } from '../../types';

const ALL = 'All';

export function ThemeCatalogScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const importedThemes = useStore(s => s.importedThemes);
  const loadImportedThemes = useStore(s => s.loadImportedThemes);
  const importThemeAction = useStore(s => s.importTheme);

  const [themes, setThemes] = useState<StarterTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<StarterTheme | null>(null);

  const importedThemeIds = useMemo(
    () => new Set(importedThemes.map(t => t.theme_id)),
    [importedThemes],
  );

  const fetchThemes = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      try {
        const data = await themesApi.listThemes();
        setThemes(Array.isArray(data) ? data : []);
      } catch {
        showToast('error', 'Failed to load theme catalog');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchThemes();
    loadImportedThemes().catch(() => {});
  }, [fetchThemes, loadImportedThemes]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchThemes(false);
    loadImportedThemes().catch(() => {});
  };

  const handleImport = async (item: StarterTheme) => {
    setImportingId(item.id);
    try {
      const imported = await importThemeAction(item.id);
      showToast('success', `Imported "${imported.name}"`);
      setDetail(null);
      await loadImportedThemes();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to import theme';
      showToast('error', msg);
    } finally {
      setImportingId(null);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>([ALL]);
    themes.forEach(t => t.category && set.add(t.category));
    return Array.from(set);
  }, [themes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return themes.filter(t => {
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q) ||
        (t.category ?? '').toLowerCase().includes(q);
      const matchCategory = activeCategory === ALL || t.category === activeCategory;
      return matchQuery && matchCategory;
    });
  }, [themes, search, activeCategory]);

  const isFiltering = search.trim().length > 0 || activeCategory !== ALL;
  const importedCount = useMemo(
    () => filtered.filter(t => importedThemeIds.has(t.id)).length,
    [filtered, importedThemeIds],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        searchWrap: {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
        },
        chipsRow: {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        },
        chip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: 7,
          borderRadius: theme.borderRadius.round,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderLight,
          borderWidth: 1,
          marginRight: theme.spacing.sm,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 32,
        },
        chipActive: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        chipText: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          textTransform: 'capitalize',
        },
        chipTextActive: { color: theme.colors.textInverse },
        chipCountInline: {
          ...theme.typography.small,
          color: theme.colors.textTertiary,
          fontWeight: '600',
        },
        chipCountInlineActive: {
          color: theme.colors.textInverse,
          opacity: 0.85,
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.xs,
        },
        metaLabel: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
        },
        metaLink: {
          ...theme.typography.captionMedium,
          color: theme.colors.primary,
        },
        list: {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.xxxl + insets.bottom,
        },
        row: { gap: theme.spacing.md },
        card: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.md,
          overflow: 'hidden',
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.shadows.sm,
        },
        cardImported: {
          borderColor: theme.colors.primary,
          borderWidth: 1.5,
        },
        thumbWrap: {
          width: '100%',
          aspectRatio: 4 / 5,
          backgroundColor: theme.colors.surfaceSecondary,
          position: 'relative',
        },
        thumbImage: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        },
        thumbPlaceholder: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primarySoft,
        },
        thumbPlaceholderInner: {
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.sm,
        },
        thumbPlaceholderText: {
          ...theme.typography.h2,
          color: theme.colors.textInverse,
        },
        thumbOverlay: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.xs,
        },
        versionPill: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 3,
          borderRadius: theme.borderRadius.round,
          backgroundColor: 'rgba(0,0,0,0.55)',
        },
        versionText: {
          ...theme.typography.small,
          color: '#FFFFFF',
          fontWeight: '600',
        },
        importedBadge: {
          position: 'absolute',
          top: theme.spacing.sm,
          right: theme.spacing.sm,
        },
        body: {
          padding: theme.spacing.md,
          gap: theme.spacing.xs,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
        },
        title: {
          ...theme.typography.bodyMedium,
          color: theme.colors.text,
          flex: 1,
        },
        categoryBadge: {
          alignSelf: 'flex-start',
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.round,
          backgroundColor: theme.colors.surfaceSecondary,
        },
        categoryText: {
          ...theme.typography.small,
          color: theme.colors.textSecondary,
          textTransform: 'capitalize',
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        description: {
          ...theme.typography.small,
          color: theme.colors.textTertiary,
          lineHeight: 14,
        },
        cardActions: {
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          paddingTop: theme.spacing.xs,
        },

        modalOverlay: {
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: 'center',
          padding: theme.spacing.lg,
        },
        modalCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          overflow: 'hidden',
          maxHeight: Dimensions.get('window').height * 0.85,
          ...theme.shadows.lg,
        },
        modalHero: {
          width: '100%',
          aspectRatio: 16 / 10,
          backgroundColor: theme.colors.surfaceSecondary,
          position: 'relative',
        },
        modalHeroImage: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        },
        modalImportedBadge: {
          position: 'absolute',
          top: theme.spacing.md,
          right: theme.spacing.md,
        },
        modalScroll: {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.md,
        },
        modalHeaderRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
        },
        modalTitle: {
          ...theme.typography.h3,
          color: theme.colors.text,
          flex: 1,
        },
        modalCategoryRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginTop: theme.spacing.xs,
        },
        modalCategory: {
          ...theme.typography.captionMedium,
          color: theme.colors.primary,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        },
        modalVersion: {
          ...theme.typography.caption,
          color: theme.colors.textTertiary,
        },
        modalDesc: {
          ...theme.typography.body,
          color: theme.colors.textSecondary,
          marginTop: theme.spacing.md,
        },
        modalSection: {
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
          gap: theme.spacing.xs,
        },
        modalKey: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        modalVal: {
          ...theme.typography.caption,
          color: theme.colors.text,
        },
        codeBlock: {
          backgroundColor: theme.colors.surfaceSecondary,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          marginTop: theme.spacing.xs,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        codeText: {
          ...theme.typography.caption,
          color: theme.colors.textSecondary,
          fontFamily: 'monospace',
        },
        modalActions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
          backgroundColor: theme.colors.surface,
        },
      }),
    [theme, insets.bottom],
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    map.set(ALL, themes.length);
    themes.forEach(t => {
      const k = t.category || 'general';
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return map;
  }, [themes]);

  const renderItem = ({ item }: { item: StarterTheme }) => {
    const imported = importedThemeIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, imported && styles.cardImported]}
        activeOpacity={0.85}
        onPress={() => setDetail(item)}>
        <View style={styles.thumbWrap}>
          <View style={styles.thumbPlaceholder}>
            <View style={styles.thumbPlaceholderInner}>
              <Text style={styles.thumbPlaceholderText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          {item.thumbnail ? (
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.thumbImage}
              resizeMode="cover"
            />
          ) : null}
          {item.version ? (
            <View style={styles.thumbOverlay} pointerEvents="none">
              <View style={styles.versionPill}>
                <Text style={styles.versionText}>v{item.version}</Text>
              </View>
            </View>
          ) : null}
          {imported ? (
            <View style={styles.importedBadge}>
              <StatusBadge label="Imported" tone="success" dot />
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {item.category || 'general'}
            </Text>
          </View>
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.cardActions}>
          <ActionButton
            label={
              importingId === item.id
                ? 'Importing…'
                : imported
                  ? 'Import again'
                  : 'Import'
            }
            variant={imported ? 'outline' : 'primary'}
            size="sm"
            fullWidth
            loading={importingId === item.id}
            disabled={importingId !== null}
            onPress={() => handleImport(item)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const detailImported = detail ? importedThemeIds.has(detail.id) : false;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Theme Catalog"
        subtitle={`${themes.length} starter${themes.length === 1 ? '' : 's'} available`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, category, description"
        />
      </View>

      {categories.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {categories.map(cat => {
            const active = cat === activeCategory;
            const count = categoryCounts.get(cat) ?? 0;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.85}>
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                  numberOfLines={1}>
                  {cat}
                  <Text
                    style={[
                      styles.chipCountInline,
                      active && styles.chipCountInlineActive,
                    ]}>
                    {`  ${count}`}
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}

      {loading ? (
        <LoadingState message="Loading themes…" />
      ) : (
        <>
          {filtered.length > 0 ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>
                {isFiltering
                  ? `Showing ${filtered.length} of ${themes.length}`
                  : `${filtered.length} theme${filtered.length === 1 ? '' : 's'}`}
                {importedCount > 0 ? ` · ${importedCount} imported` : ''}
              </Text>
              {isFiltering ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearch('');
                    setActiveCategory(ALL);
                  }}
                  hitSlop={8}>
                  <Text style={styles.metaLink}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            numColumns={2}
            contentContainerStyle={styles.list}
            columnWrapperStyle={styles.row}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              <EmptyState
                icon="◫"
                title="No themes found"
                description={
                  isFiltering
                    ? 'Try a different keyword or clear filters.'
                    : 'The catalog is empty right now.'
                }
                actionLabel={isFiltering ? 'Clear filters' : undefined}
                onAction={
                  isFiltering
                    ? () => {
                        setSearch('');
                        setActiveCategory(ALL);
                      }
                    : undefined
                }
              />
            }
          />
        </>
      )}

      <Modal
        visible={!!detail}
        transparent
        animationType="fade"
        onRequestClose={() => setDetail(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {detail ? (
              <>
                <View style={styles.modalHero}>
                  <View style={styles.thumbPlaceholder}>
                    <View style={styles.thumbPlaceholderInner}>
                      <Text style={styles.thumbPlaceholderText}>
                        {detail.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {detail.thumbnail ? (
                    <Image
                      source={{ uri: detail.thumbnail }}
                      style={styles.modalHeroImage}
                      resizeMode="cover"
                    />
                  ) : null}
                  {detailImported ? (
                    <View style={styles.modalImportedBadge}>
                      <StatusBadge label="Imported" tone="success" dot size="md" />
                    </View>
                  ) : null}
                </View>

                <ScrollView contentContainerStyle={styles.modalScroll}>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>{detail.name}</Text>
                  </View>
                  <View style={styles.modalCategoryRow}>
                    <Text style={styles.modalCategory}>
                      {detail.category || 'general'}
                    </Text>
                    {detail.version ? (
                      <Text style={styles.modalVersion}>· v{detail.version}</Text>
                    ) : null}
                  </View>
                  {detail.description ? (
                    <Text style={styles.modalDesc}>{detail.description}</Text>
                  ) : null}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalKey}>Slug</Text>
                    <Text style={styles.modalVal}>{detail.slug}</Text>
                    {detail.config && Object.keys(detail.config).length > 0 ? (
                      <>
                        <Text style={[styles.modalKey, { marginTop: theme.spacing.md }]}>
                          Config
                        </Text>
                        <View style={styles.codeBlock}>
                          <Text style={styles.codeText}>
                            {JSON.stringify(detail.config, null, 2)}
                          </Text>
                        </View>
                      </>
                    ) : null}
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <ActionButton
                    label="Close"
                    variant="ghost"
                    onPress={() => setDetail(null)}
                  />
                  <ActionButton
                    label={detailImported ? 'Import again' : 'Import theme'}
                    loading={importingId === detail.id}
                    disabled={importingId !== null}
                    onPress={() => handleImport(detail)}
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export type { ImportedTheme };
