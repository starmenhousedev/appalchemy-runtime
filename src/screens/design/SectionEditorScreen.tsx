import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sectionsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { SECTION_TYPES } from '../../utils/constants';
import type { Section } from '../../types';

export function SectionEditorScreen({
  route,
  navigation,
}: {
  route: { params: { pageId: number; sectionId: number } };
  navigation: any;
}) {
  const { pageId, sectionId } = route.params;
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<Section | null>(null);
  const [title, setTitle] = useState('');
  const [configJson, setConfigJson] = useState('{}');

  useEffect(() => {
    loadSection();
  }, []);

  const loadSection = async () => {
    try {
      const data = await sectionsApi.get(pageId, sectionId);
      setSection(data);
      setTitle(data.title);
      setConfigJson(JSON.stringify(data.config, null, 2));
    } catch {
      showToast('error', 'Failed to load section');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let parsedConfig = {};
      try { parsedConfig = JSON.parse(configJson); } catch {
        showToast('error', 'Invalid JSON in config');
        setSaving(false);
        return;
      }

      await sectionsApi.update(pageId, sectionId, {
        title: title.trim(),
        config: parsedConfig,
      } as Partial<Section>);
      showToast('success', 'Section updated');
      navigation.goBack();
    } catch {
      showToast('error', 'Failed to update section');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!section) return;
    try {
      const updated = await sectionsApi.toggleVisibility(pageId, sectionId);
      setSection(updated);
    } catch {
      showToast('error', 'Failed to toggle visibility');
    }
  };

  if (loading) return <LoadingOverlay fullScreen />;
  if (!section) return null;

  const typeLabel = SECTION_TYPES.find(s => s.value === section.type)?.label || section.type;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Edit Section</Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.typeRow}>
          <View style={styles.typeIndicator}>
            <Text style={styles.typeInitial}>{section.type.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.typeLabel}>{typeLabel}</Text>
            <Text style={styles.typeValue}>{section.type}</Text>
          </View>
        </View>

        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Section title" />

        <View style={styles.visibilityRow}>
          <Text style={styles.visLabel}>Visibility</Text>
          <Button
            title={section.is_visible ? 'Visible' : 'Hidden'}
            onPress={handleToggleVisibility}
            variant={section.is_visible ? 'primary' : 'outline'}
            size="sm"
          />
        </View>

        <Text style={styles.configLabel}>CONFIGURATION (JSON)</Text>
        <Text style={styles.configHint}>
          Edit the section configuration below. Changes will update the preview.
        </Text>
        <View style={styles.jsonContainer}>
          <Input
            value={configJson}
            onChangeText={setConfigJson}
            multiline
            numberOfLines={15}
            style={styles.jsonInput}
            containerStyle={styles.jsonInputContainer}
          />
        </View>
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
  typeRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.xl,
  },
  typeIndicator: {
    width: 40, height: 40, borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  typeInitial: { fontSize: 18, fontWeight: '700', color: colors.primary },
  typeLabel: { ...typography.bodyMedium, color: colors.text },
  typeValue: { ...typography.caption, color: colors.textTertiary },
  visibilityRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, marginBottom: spacing.xl,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  visLabel: { ...typography.bodyMedium, color: colors.text },
  configLabel: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs,
  },
  configHint: { ...typography.caption, color: colors.textTertiary, marginBottom: spacing.md },
  jsonContainer: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  jsonInput: {
    fontFamily: 'monospace', fontSize: 12, minHeight: 240,
    textAlignVertical: 'top',
  },
  jsonInputContainer: { marginBottom: 0 },
});
