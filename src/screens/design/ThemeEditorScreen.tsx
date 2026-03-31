import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
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
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<number | null>(null);

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
      setPages(data);
      if (data.length > 0 && !selectedPage) {
        setSelectedPage(data[0]);
      }
    } catch {
      showToast('error', 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (pageId: number) => {
    try {
      const data = await sectionsApi.list(pageId);
      setSections(data);
    } catch {
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

  // Theme import
  const handleImport = async (themeId: number) => {
    try {
      setImporting(themeId);
      const imported = await importTheme(themeId);
      showToast('success', `Theme "${imported.name}" imported!`);
      await loadImportedThemes();
    } catch {
      showToast('error', 'Failed to import theme');
    } finally {
      setImporting(null);
    }
  };

  // === THEME SELECTION VIEW ===
  if (!activeTheme && !isLoadingThemes) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.selectionHeader}>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
            <Text style={styles.menuIcon}>|||</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose a Theme</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Select a starter theme to begin building your mobile app
        </Text>
        <FlatList
          data={starterThemes}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.themeGrid}
          columnWrapperStyle={styles.themeRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.themeCard}
              onPress={() => handleImport(item.id)}
              disabled={importing !== null}>
              <View style={styles.themeThumbnail}>
                {item.thumbnail ? (
                  <Image source={{ uri: item.thumbnail }} style={styles.themeImage} resizeMode="cover" />
                ) : (
                  <View style={styles.themePlaceholder}>
                    <Text style={styles.themePlaceholderText}>{item.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.themeName}>{item.name}</Text>
              <Text style={styles.themeCategory}>{item.category}</Text>
              <Button
                title={importing === item.id ? 'Importing...' : 'Import'}
                onPress={() => handleImport(item.id)}
                variant="outline" size="sm"
                loading={importing === item.id}
                disabled={importing !== null}
                style={styles.importBtn}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  if (isLoadingThemes && !activeTheme) {
    return <LoadingOverlay fullScreen message="Loading themes..." />;
  }

  // === EDITOR VIEW ===
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Editor Header */}
      <View style={styles.editorHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>|||</Text>
        </TouchableOpacity>
        <View style={styles.editorHeaderCenter}>
          <Text style={styles.editorTitle} numberOfLines={1}>{activeTheme?.name}</Text>
          <Text style={styles.editorSubtitle}>
            {selectedPage ? selectedPage.title : 'Select a page'}
          </Text>
        </View>
        <DeviceSelector selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice} />
        <Button
          title="Settings"
          onPress={() => navigation.navigate('ThemeSettings', { themeId: activeTheme?.id })}
          variant="ghost" size="sm"
        />
      </View>

      {/* Tab bar for phone layout */}
      {!isTablet && (
        <View style={styles.tabBar}>
          {(['pages', 'sections', 'preview'] as EditorTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, editorTab === tab && styles.tabActive]}
              onPress={() => setEditorTab(tab)}>
              <Text style={[styles.tabText, editorTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.editorBody}>
        {/* Left panel - Pages & Sections (visible on tablet or when tab selected) */}
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
            />
          </View>
        )}

        {(isTablet || editorTab === 'sections') && (
          <View style={[styles.leftPanel, !isTablet && styles.fullPanel]}>
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
              onEditSection={section =>
                navigation.navigate('SectionEditor', {
                  pageId: selectedPage?.id,
                  sectionId: section.id,
                })
              }
            />
            {selectedPage && (
              <TouchableOpacity
                style={styles.bottomBarLink}
                onPress={() =>
                  navigation.navigate('BottomBarEditor', { themeId: activeTheme?.id })
                }>
                <Text style={styles.bottomBarLinkText}>Edit Bottom Bar</Text>
                <Text style={styles.chevron}>{'>'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Right panel - Phone simulator */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Selection view
  selectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md,
  },
  headerTitle: { ...typography.h2, color: colors.text },
  headerSubtitle: {
    ...typography.body, color: colors.textSecondary,
    paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.lg,
  },
  themeGrid: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  themeRow: { gap: spacing.md },
  themeCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, marginBottom: spacing.md, ...shadows.sm,
  },
  themeThumbnail: { height: 140, borderRadius: borderRadius.md, overflow: 'hidden', marginBottom: spacing.sm },
  themeImage: { width: '100%', height: '100%' },
  themePlaceholder: {
    flex: 1, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  themePlaceholderText: { fontSize: 32, fontWeight: '700', color: colors.textInverse },
  themeName: { ...typography.bodyMedium, color: colors.text },
  themeCategory: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  importBtn: { marginTop: spacing.xs },
  // Editor view
  editorHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface, gap: spacing.sm,
  },
  menuButton: {
    width: 36, height: 36, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center',
  },
  menuIcon: { fontSize: 14, color: colors.text, letterSpacing: -2 },
  editorHeaderCenter: { flex: 1, minWidth: 0 },
  editorTitle: { ...typography.bodyMedium, color: colors.text },
  editorSubtitle: { ...typography.small, color: colors.textTertiary },
  // Tab bar (phone)
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { ...typography.captionMedium, color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  // Editor body
  editorBody: { flex: 1, flexDirection: 'row' },
  leftPanel: {
    width: 220, borderRightWidth: 1, borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  rightPanel: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceSecondary, padding: spacing.md,
  },
  fullPanel: { flex: 1, width: undefined },
  bottomBarLink: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  bottomBarLinkText: { ...typography.captionMedium, color: colors.primary },
  chevron: { ...typography.caption, color: colors.textTertiary },
});
