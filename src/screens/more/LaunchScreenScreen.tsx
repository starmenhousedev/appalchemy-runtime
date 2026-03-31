import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appSettingsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import type { LaunchScreen } from '../../types';

export function LaunchScreenScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [launchScreen, setLaunchScreen] = useState<LaunchScreen | null>(null);
  const [selectedType, setSelectedType] = useState<'image' | 'video'>('image');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await appSettingsApi.getLaunchScreen();
      setLaunchScreen(data);
      setSelectedType(data.launch_screen_type);
    } catch {
      // No launch screen set yet
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await appSettingsApi.updateLaunchScreen({
        launch_screen_type: selectedType,
        launch_screen_url: launchScreen?.launch_screen_url || '',
      });
      setLaunchScreen(updated);
      showToast('success', 'Launch screen updated');
    } catch {
      showToast('error', 'Failed to update launch screen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Launch Screen</Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>SCREEN TYPE</Text>
        <View style={styles.typeRow}>
          {(['image', 'video'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, selectedType === t && styles.typeBtnActive]}
              onPress={() => setSelectedType(t)}>
              <Text style={[styles.typeBtnText, selectedType === t && styles.typeBtnTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>PREVIEW</Text>
        <View style={styles.previewCard}>
          {launchScreen?.launch_screen_url ? (
            <Image source={{ uri: launchScreen.launch_screen_url }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewPlaceholderText}>
                {selectedType === 'image' ? 'No image uploaded' : 'No video uploaded'}
              </Text>
              <Text style={styles.previewHint}>
                Upload via the media API or admin panel
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Recommendations</Text>
          <Text style={styles.infoText}>
            {selectedType === 'image'
              ? 'Use a 1242x2688px PNG or JPEG image. Keep file size under 2MB for fast loading.'
              : 'Use a short (2-3 second) MP4 video. Max 5MB. Loop-friendly content works best.'}
          </Text>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionTitle: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
    backgroundColor: colors.surface,
  },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  typeBtnText: { ...typography.bodyMedium, color: colors.textSecondary },
  typeBtnTextActive: { color: colors.primary },
  previewCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    overflow: 'hidden', ...shadows.sm,
  },
  previewImage: { width: '100%', height: 400 },
  previewPlaceholder: {
    height: 300, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  previewPlaceholderText: { ...typography.body, color: colors.textTertiary },
  previewHint: { ...typography.small, color: colors.textTertiary, marginTop: spacing.xs },
  infoCard: {
    backgroundColor: colors.info + '10', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginTop: spacing.lg,
  },
  infoTitle: { ...typography.captionMedium, color: colors.info, marginBottom: spacing.xs },
  infoText: { ...typography.caption, color: colors.text, lineHeight: 20 },
});
