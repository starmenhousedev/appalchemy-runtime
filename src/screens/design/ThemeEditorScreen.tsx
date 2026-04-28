import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store';
import { pagesApi, sectionsApi, bottomBarApi } from '../../api';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { Button } from '../../components/common/Button';
import { PhoneSimulator } from '../../components/design/PhoneSimulator';
import { DeviceSelector, DEFAULT_DEVICES } from '../../components/design/DeviceSelector';
import { PageListPanel } from '../../components/design/PageListPanel';
import { SectionListPanel } from '../../components/design/SectionListPanel';
import { AddPageModal } from '../../components/design/AddPageModal';
import { AddSectionModal } from '../../components/design/AddSectionModal';
import type { Page, Section, BottomBarItem, PreviewDevice, PageType, SectionType } from '../../types';

type EditorTab = 'pages' | 'sections' | 'preview';

const ALL_CATEGORIES = 'All';

export function ThemeEditorScreen({ navigation }: { navigation: any }) {
  const {
    starterThemes, importedThemes, activeTheme, isLoadingThemes,
    loadStarterThemes, loadImportedThemes, importTheme, showToast,
  } = useStore();

  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth > 768;
  const insets = useSafeAreaInsets();

  // Editor state
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [bottomBarItems, setBottomBarItems] = useState<BottomBarItem[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<PreviewDevice>(DEFAULT_DEVICES[0]);
  const [editorTab, setEditorTab] = useState<EditorTab>(isTablet ? 'pages' : 'preview');
  const [, setLoading] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);

  // Selection-view filters
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  // Modals
  const [showAddPage, setShowAddPage] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [addingPage, setAddingPage] = useState(false);
  const [addingSection, setAddingSection] = useState(false);

  useEffect(() => {
    loadStarterThemes();
    loadImportedThemes();
  }, []);

  // Load pages when active theme changes
  useEffect(() => {
    if (activeTheme) {
      loadPages();
      loadBottomBar();
    }
  }, [activeTheme?.id]);

  // Load sections when selected page changes
  useEffect(() => {
    if (selectedPage) {
      loadSections(selectedPage.id);
    } else {
      setSections([]);
    }
  }, [selectedPage?.id]);

  const loadPages = async () => {
    if (!activeTheme) return;
    setLoading(true);
    try {
      const data = await pagesApi.list(activeTheme.id);
      const safe = Array.isArray(data) ? data : [];
      setPages(safe);
      if (safe.length > 0 && !selectedPage) {
        setSelectedPage(safe[0]);
      }
    } catch {
      setPages([]);
      showToast('error', 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (pageId: number) => {
    try {
      const data = await sectionsApi.list(pageId);
      setSections(Array.isArray(data) ? data : []);
    } catch {
      setSections([]);
      showToast('error', 'Failed to load sections');
    }
  };

  const loadBottomBar = async () => {
    if (!activeTheme) return;
    try {
      const data = await bottomBarApi.get(activeTheme.id);
      setBottomBarItems(data);
    } catch { /* ignore */ }
  };

  // Page actions
  const handleAddPage = async (title: string, type: PageType) => {
    if (!activeTheme) return;
    setAddingPage(true);
    try {
      const page = await pagesApi.create(activeTheme.id, { title, type });
      setPages(prev => [...prev, page]);
      setSelectedPage(page);
      setShowAddPage(false);
      showToast('success', `Page "${title}" created`);
    } catch {
      showToast('error', 'Failed to create page');
    } finally {
      setAddingPage(false);
    }
  };

  const handleTogglePageVisibility = async (pageId: number) => {
    if (!activeTheme) return;
    try {
      const updated = await pagesApi.toggleVisibility(activeTheme.id, pageId);
      setPages(prev => prev.map(p => (p.id === pageId ? updated : p)));
    } catch {
      showToast('error', 'Failed to toggle visibility');
    }
  };

  const handleDeletePage = async (pageId: number) => {
    if (!activeTheme) return;
    try {
      await pagesApi.delete(activeTheme.id, pageId);
      setPages(prev => prev.filter(p => p.id !== pageId));
      if (selectedPage?.id === pageId) {
        setSelectedPage(pages.find(p => p.id !== pageId) || null);
      }
      showToast('success', 'Page deleted');
    } catch {
      showToast('error', 'Failed to delete page');
    }
  };

  const handleDuplicatePage = async (pageId: number) => {
    if (!activeTheme) return;
    try {
      const dup = await pagesApi.duplicate(activeTheme.id, pageId);
      setPages(prev => [...prev, dup]);
      showToast('success', 'Page duplicated');
    } catch {
      showToast('error', 'Failed to duplicate page');
    }
  };

  const handleReorderPages = async (pageIds: number[]) => {
    if (!activeTheme) return;
    try {
      await pagesApi.reorder(activeTheme.id, pageIds);
      await loadPages();
    } catch {
      showToast('error', 'Failed to reorder pages');
    }
  };

  // Section actions
  const handleAddSection = async (type: SectionType, title: string) => {
    if (!selectedPage) return;
    setAddingSection(true);
    try {
      const section = await sectionsApi.create(selectedPage.id, { type, title });
      setSections(prev => [...prev, section]);
      setShowAddSection(false);
      showToast('success', `${title} added`);
    } catch {
      showToast('error', 'Failed to add section');
    } finally {
      setAddingSection(false);
    }
  };

  const handleToggleSectionVisibility = async (sectionId: number) => {
    if (!selectedPage) return;
    try {
      const updated = await sectionsApi.toggleVisibility(selectedPage.id, sectionId);
      setSections(prev => prev.map(s => (s.id === sectionId ? updated : s)));
    } catch {
      showToast('error', 'Failed to toggle visibility');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!selectedPage) return;
    try {
      await sectionsApi.delete(selectedPage.id, sectionId);
      setSections(prev => prev.filter(s => s.id !== sectionId));
      showToast('success', 'Section deleted');
    } catch {
      showToast('error', 'Failed to delete section');
    }
  };

  const handleReorderSections = async (sectionIds: number[]) => {
    if (!selectedPage) return;
    // Optimistic local update
    setSections(prev => {
      const byId = new Map(prev.map(s => [s.id, s]));
      return sectionIds
        .map((id, i) => {
          const s = byId.get(id);
          return s ? { ...s, sort_order: i } : null;
        })
        .filter((s): s is Section => !!s);
    });
    try {
      await sectionsApi.reorder(selectedPage.id, sectionIds);
    } catch {
      showToast('error', 'Failed to reorder sections');
      loadSections(selectedPage.id);
    }
  };

  // Theme import
  const handleImport = async (themeId: number) => {
    try {
      setImporting(themeId);
      const imported = await importTheme(themeId);
      showToast('success', `Theme "${imported.name}" imported!`);
      await loadImportedThemes();
    } catch (e: any) {
      const status = e?.response?.status;
      const serverMessage =
        e?.response?.data?.message || e?.response?.data?.error || e?.message;
      console.warn('[importTheme] failed', { themeId, status, serverMessage, data: e?.response?.data });
      showToast(
        'error',
        serverMessage
          ? `Failed to import: ${serverMessage}`
          : 'Failed to import theme',
      );
    } finally {
      setImporting(null);
    }
  };

  // === THEME SELECTION VIEW ===
  if (!activeTheme && !isLoadingThemes) {
    const categories = useMemoCategories(starterThemes);
    const importedIds = new Set(importedThemes.map(t => t.theme_id));

    const filtered = starterThemes.filter(t => {
      const matchesQuery =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === ALL_CATEGORIES || t.category === activeCategory;
      return matchesQuery && matchesCategory;
    });

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.selectionHeader}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.openDrawer()}
            activeOpacity={0.7}>
            <MenuIcon />
          </TouchableOpacity>
          <View style={styles.selectionHeaderText}>
            <Text style={styles.headerEyebrow}>Design</Text>
            <Text style={styles.headerTitle}>Choose a Theme</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}>
          {/* Hero card */}
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Text style={styles.heroIcon}>✨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Build a stunning mobile app</Text>
              <Text style={styles.heroSubtitle}>
                Pick a starter theme and customize pages, sections and the bottom bar in minutes.
              </Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search themes by name or category"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category chips */}
          {categories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {categories.map(cat => {
                const active = cat === activeCategory;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setActiveCategory(cat)}
                    style={[styles.chip, active && styles.chipActive]}
                    activeOpacity={0.7}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Theme grid */}
          {filtered.length === 0 ? (
            <View style={styles.gridEmpty}>
              <Text style={styles.gridEmptyIcon}>🎨</Text>
              <Text style={styles.gridEmptyTitle}>No themes match your search</Text>
              <Text style={styles.gridEmptySub}>
                Try a different keyword or clear filters.
              </Text>
              {(search || activeCategory !== ALL_CATEGORIES) && (
                <Button
                  title="Clear filters"
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    setSearch('');
                    setActiveCategory(ALL_CATEGORIES);
                  }}
                  style={{ marginTop: spacing.md }}
                />
              )}
            </View>
          ) : (
            <FlatList
              data={filtered}
              numColumns={2}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.themeGrid}
              columnWrapperStyle={styles.themeRow}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const isImported = importedIds.has(item.id);
                const isImporting = importing === item.id;
                return (
                  <TouchableOpacity
                    style={styles.themeCard}
                    onPress={() => handleImport(item.id)}
                    disabled={importing !== null}
                    activeOpacity={0.85}>
                    <View style={styles.themeThumbnail}>
                      {item.thumbnail ? (
                        <Image
                          source={{ uri: item.thumbnail }}
                          style={styles.themeImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.themePlaceholder}>
                          <Text style={styles.themePlaceholderText}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {isImported && (
                        <View style={styles.importedBadge}>
                          <Text style={styles.importedBadgeText}>Imported</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.themeCardBody}>
                      <Text style={styles.themeName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.themeCategory} numberOfLines={1}>
                        {item.category || 'General'}
                      </Text>
                      <Button
                        title={
                          isImporting
                            ? 'Importing...'
                            : isImported
                              ? 'Import again'
                              : 'Import theme'
                        }
                        onPress={() => handleImport(item.id)}
                        variant={isImported ? 'outline' : 'primary'}
                        size="sm"
                        loading={isImporting}
                        disabled={importing !== null}
                        style={styles.importBtn}
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </ScrollView>
      </View>
    );
  }

  if (isLoadingThemes && !activeTheme) {
    return <LoadingOverlay fullScreen message="Loading themes..." />;
  }

  // === EDITOR VIEW ===
  const tabs: { key: EditorTab; label: string; count?: number }[] = [
    { key: 'pages', label: 'Pages', count: pages.length },
    { key: 'sections', label: 'Sections', count: sections.length },
    { key: 'preview', label: 'Preview' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Editor Header */}
      <View style={styles.editorHeader}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}>
          <MenuIcon />
        </TouchableOpacity>

        <View style={styles.editorHeaderCenter}>
          <Text style={styles.editorEyebrow}>
            {selectedPage ? selectedPage.title : 'Design'}
          </Text>
          <Text style={styles.editorTitle} numberOfLines={1}>
            {activeTheme?.name}
          </Text>
        </View>

        {isTablet && (
          <DeviceSelector
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
          />
        )}

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            activeTheme &&
            navigation.navigate('Preview', {
              themeId: activeTheme.id,
              pageId: selectedPage?.id,
            })
          }
          activeOpacity={0.7}>
          <PreviewIcon />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate('ThemeSettings', { themeId: activeTheme?.id })
          }
          activeOpacity={0.7}>
          <SettingsIcon />
        </TouchableOpacity>
      </View>

      {/* Phone-only secondary row: device selector + segmented tabs */}
      {!isTablet && (
        <View style={styles.phoneSubHeader}>
          <DeviceSelector
            selectedDevice={selectedDevice}
            onSelectDevice={setSelectedDevice}
          />
        </View>
      )}

      {!isTablet && (
        <View style={styles.segmentedWrap}>
          <View style={styles.segmented}>
            {tabs.map(t => {
              const active = editorTab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setEditorTab(t.key)}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}>
                    {t.label}
                  </Text>
                  {typeof t.count === 'number' && (
                    <View
                      style={[
                        styles.segmentBadge,
                        active && styles.segmentBadgeActive,
                      ]}>
                      <Text
                        style={[
                          styles.segmentBadgeText,
                          active && styles.segmentBadgeTextActive,
                        ]}>
                        {t.count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.editorBody}>
        {/* Pages panel */}
        {(isTablet || editorTab === 'pages') && (
          <View style={[styles.leftPanel, !isTablet && styles.fullPanel]}>
            <PageListPanel
              pages={pages}
              selectedPageId={selectedPage?.id || null}
              onSelectPage={page => {
                setSelectedPage(page);
                if (!isTablet) setEditorTab('sections');
              }}
              onToggleVisibility={handleTogglePageVisibility}
              onDeletePage={handleDeletePage}
              onDuplicatePage={handleDuplicatePage}
              onAddPage={() => setShowAddPage(true)}
              onReorder={handleReorderPages}
              onEditPage={page =>
                activeTheme &&
                navigation.navigate('PageEditor', {
                  themeId: activeTheme.id,
                  pageId: page.id,
                })
              }
            />
          </View>
        )}

        {/* Sections panel */}
        {(isTablet || editorTab === 'sections') && (
          <View style={[styles.middlePanel, !isTablet && styles.fullPanel]}>
            {!selectedPage ? (
              <View style={styles.noPageState}>
                <Text style={styles.noPageIcon}>📄</Text>
                <Text style={styles.noPageTitle}>Select a page</Text>
                <Text style={styles.noPageSubtitle}>
                  Pick a page from the list to edit its sections.
                </Text>
                {!isTablet && (
                  <Button
                    title="Go to pages"
                    variant="outline"
                    size="sm"
                    onPress={() => setEditorTab('pages')}
                    style={{ marginTop: spacing.md }}
                  />
                )}
              </View>
            ) : (
              <>
                <SectionListPanel
                  sections={sections}
                  selectedSectionId={selectedSection?.id || null}
                  onSelectSection={section => {
                    setSelectedSection(section);
                    if (!isTablet) setEditorTab('preview');
                  }}
                  onToggleVisibility={handleToggleSectionVisibility}
                  onDeleteSection={handleDeleteSection}
                  onAddSection={() => setShowAddSection(true)}
                  onReorder={handleReorderSections}
                  onEditSection={section =>
                    navigation.navigate('SectionEditor', {
                      pageId: selectedPage?.id,
                      sectionId: section.id,
                    })
                  }
                />
                <TouchableOpacity
                  style={styles.bottomBarLink}
                  onPress={() =>
                    navigation.navigate('BottomBarEditor', { themeId: activeTheme?.id })
                  }
                  activeOpacity={0.85}>
                  <View style={styles.bottomBarLinkIcon}>
                    <Text style={styles.bottomBarLinkIconText}>≡</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bottomBarLinkTitle}>Bottom Bar</Text>
                    <Text style={styles.bottomBarLinkSub}>
                      {bottomBarItems.length > 0
                        ? `${bottomBarItems.length} item${bottomBarItems.length === 1 ? '' : 's'} configured`
                        : 'Not configured yet'}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Preview panel */}
        {(isTablet || editorTab === 'preview') && (
          <View style={[styles.rightPanel, !isTablet && styles.fullPanel]}>
            <PhoneSimulator
              device={selectedDevice}
              sections={sections}
              bottomBarItems={bottomBarItems}
              pageName={selectedPage?.title}
            />
          </View>
        )}
      </View>

      {/* Modals */}
      <AddPageModal
        visible={showAddPage}
        onClose={() => setShowAddPage(false)}
        onAdd={handleAddPage}
        loading={addingPage}
      />
      <AddSectionModal
        visible={showAddSection}
        onClose={() => setShowAddSection(false)}
        onAdd={handleAddSection}
        loading={addingSection}
      />
    </View>
  );
}

// Inline icons (View-based so they render consistently across platforms)
function MenuIcon() {
  return (
    <View>
      <View style={iconStyles.menuLine} />
      <View style={[iconStyles.menuLine, { marginTop: 3 }]} />
      <View style={[iconStyles.menuLine, { marginTop: 3 }]} />
    </View>
  );
}

function SettingsIcon() {
  return (
    <View style={iconStyles.gearWrap}>
      <View style={iconStyles.gearOuter} />
      <View style={iconStyles.gearInner} />
    </View>
  );
}

function PreviewIcon() {
  return (
    <View style={iconStyles.eyeWrap}>
      <View style={iconStyles.eyeOuter} />
      <View style={iconStyles.eyeInner} />
    </View>
  );
}

function useMemoCategories(themes: { category?: string }[]): string[] {
  const set = new Set<string>([ALL_CATEGORIES]);
  themes.forEach(t => {
    if (t.category) set.add(t.category);
  });
  return Array.from(set);
}

const iconStyles = StyleSheet.create({
  menuLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text,
  },
  gearWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.text,
  },
  gearInner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
  },
  eyeWrap: {
    width: 22,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOuter: {
    width: 22,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.text,
  },
  eyeInner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.text,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ---- Selection view ----
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  selectionHeaderText: { flex: 1 },
  headerEyebrow: {
    ...typography.small,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: { ...typography.h2, color: colors.text },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary + '22',
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  heroIcon: { fontSize: 22 },
  heroTitle: { ...typography.h4, color: colors.text },
  heroSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchIcon: { fontSize: 16, color: colors.textTertiary },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
    color: colors.text,
  },
  searchClear: {
    ...typography.caption,
    color: colors.textTertiary,
    paddingHorizontal: spacing.xs,
  },

  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { ...typography.captionMedium, color: colors.textSecondary },
  chipTextActive: { color: colors.textInverse },

  themeGrid: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  themeRow: { gap: spacing.md },
  themeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  themeThumbnail: {
    aspectRatio: 16 / 10,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
  },
  themeImage: { width: '100%', height: '100%' },
  themePlaceholder: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themePlaceholderText: { fontSize: 36, fontWeight: '700', color: colors.textInverse },
  importedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.success,
    borderRadius: borderRadius.round,
  },
  importedBadgeText: {
    ...typography.small,
    color: colors.textInverse,
    fontWeight: '600',
  },
  themeCardBody: { padding: spacing.md },
  themeName: { ...typography.bodyMedium, color: colors.text },
  themeCategory: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
    textTransform: 'capitalize',
  },
  importBtn: { marginTop: spacing.xs },

  gridEmpty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  gridEmptyIcon: { fontSize: 36, marginBottom: spacing.sm },
  gridEmptyTitle: { ...typography.bodyMedium, color: colors.text },
  gridEmptySub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // ---- Editor view ----
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorHeaderCenter: { flex: 1, minWidth: 0 },
  editorEyebrow: {
    ...typography.small,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  editorTitle: {
    ...typography.h4,
    color: colors.text,
    marginTop: 1,
  },

  phoneSubHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
  },

  // Segmented control (phone)
  segmentedWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.sm + 2,
    gap: 6,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  segmentText: { ...typography.captionMedium, color: colors.textSecondary },
  segmentTextActive: { color: colors.text, fontWeight: '600' },
  segmentBadge: {
    minWidth: 18,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  segmentBadgeActive: { backgroundColor: colors.primarySoft },
  segmentBadgeText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  segmentBadgeTextActive: { color: colors.primary },

  // Editor body
  editorBody: { flex: 1, flexDirection: 'row' },
  leftPanel: {
    width: 240,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  middlePanel: {
    width: 260,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
  },
  fullPanel: { flex: 1, width: undefined },

  noPageState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  noPageIcon: { fontSize: 32, marginBottom: spacing.sm },
  noPageTitle: { ...typography.bodyMedium, color: colors.text },
  noPageSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  bottomBarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  bottomBarLinkIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarLinkIconText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  bottomBarLinkTitle: { ...typography.captionMedium, color: colors.text },
  bottomBarLinkSub: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.textTertiary, marginLeft: spacing.xs },
});
