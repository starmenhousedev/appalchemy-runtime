import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pagesApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { PAGE_TYPES } from '../../utils/constants';
import type { Page, PageType } from '../../types';

export function PageEditorScreen({
  route,
  navigation,
}: {
  route: { params: { themeId: number; pageId: number } };
  navigation: any;
}) {
  const { themeId, pageId } = route.params;
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PageType>('blank');
  const [isVisible, setIsVisible] = useState(true);
  const [settings, setSettings] = useState('{}');

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      const page = await pagesApi.get(themeId, pageId);
      setTitle(page.title);
      setType(page.type);
      setIsVisible(page.is_visible);
      setSettings(JSON.stringify(page.settings, null, 2));
    } catch {
      showToast('error', 'Failed to load page');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('error', 'Title is required');
      return;
    }
    setSaving(true);
    try {
      let parsedSettings = {};
      try { parsedSettings = JSON.parse(settings); } catch { /* keep empty */ }

      await pagesApi.update(themeId, pageId, {
        title: title.trim(),
        settings: parsedSettings,
      } as Partial<Page>);
      showToast('success', 'Page updated');
      navigation.goBack();
    } catch {
      showToast('error', 'Failed to update page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay fullScreen />;

  const typeLabel = PAGE_TYPES.find(t => t.value === type)?.label || type;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Edit Page</Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Input label="Page Title" value={title} onChangeText={setTitle} placeholder="Page title" />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Visibility</Text>
          <Button
            title={isVisible ? 'Visible' : 'Hidden'}
            onPress={async () => {
              try {
                const updated = await pagesApi.toggleVisibility(themeId, pageId);
                setIsVisible(updated.is_visible);
              } catch {
                showToast('error', 'Failed to toggle');
              }
            }}
            variant={isVisible ? 'primary' : 'outline'}
            size="sm"
          />
        </View>

        <Input
          label="Settings (JSON)"
          value={settings}
          onChangeText={setSettings}
          multiline
          numberOfLines={8}
          style={styles.jsonInput}
        />
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
  form: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    marginBottom: spacing.lg,
  },
  infoLabel: { ...typography.bodyMedium, color: colors.text },
  typeBadge: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm, backgroundColor: colors.primary + '15',
  },
  typeBadgeText: { ...typography.captionMedium, color: colors.primary },
  jsonInput: {
    fontFamily: 'monospace', fontSize: 12, minHeight: 160,
    textAlignVertical: 'top',
  },
});
