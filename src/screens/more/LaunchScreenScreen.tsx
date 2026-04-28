import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appSettingsApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { SectionCard } from '../../components/common/SectionCard';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import type { LaunchScreen } from '../../types';

const isHttpUrl = (s: string) => /^https?:\/\//i.test(s.trim());

export function LaunchScreenScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [, setLaunchScreen] = useState<LaunchScreen | null>(null);
  const [selectedType, setSelectedType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await appSettingsApi.getLaunchScreen();
        if (data) {
          setLaunchScreen(data);
          setSelectedType(data.launch_screen_type ?? 'image');
          setMediaUrl(data.launch_screen_url ?? '');
        }
      } catch {
        // No launch screen yet
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    const trimmed = mediaUrl.trim();
    if (trimmed && !isHttpUrl(trimmed)) {
      showToast('error', 'URL must start with http:// or https://');
      return;
    }
    setSaving(true);
    try {
      const updated = await appSettingsApi.updateLaunchScreen({
        launch_screen_type: selectedType,
        launch_screen_url: trimmed,
      });
      setLaunchScreen(updated);
      showToast('success', 'Launch screen updated');
    } catch {
      showToast('error', 'Failed to update launch screen');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    const trimmed = mediaUrl.trim();
    if (!isHttpUrl(trimmed)) {
      showToast('error', 'Paste a public http(s) URL first');
      return;
    }
    setUploading(true);
    try {
      const filename = trimmed.split('/').pop()?.split('?')[0] ||
        `launch-${Date.now()}${selectedType === 'video' ? '.mp4' : '.png'}`;
      const formData = new FormData();
      formData.append('file', {
        uri: trimmed,
        name: filename,
        type: selectedType === 'video' ? 'video/mp4' : 'image/png',
      } as unknown as Blob);
      const result = await appSettingsApi.uploadLaunchMedia(formData);
      if (result?.url) {
        setMediaUrl(result.url);
        showToast('success', 'Hosted on app CDN');
      } else {
        showToast('error', 'Upload returned no URL');
      }
    } catch {
      showToast('error', 'Failed to host media');
    } finally {
      setUploading(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.md },
        typeRow: { flexDirection: 'row', gap: theme.spacing.sm },
        typeBtn: {
          flex: 1,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1.5,
          borderColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surfaceSecondary,
          alignItems: 'center',
        },
        typeBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
        typeBtnText: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary },
        typeBtnTextActive: { color: theme.colors.primary },
        previewCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          overflow: 'hidden',
          ...theme.shadows.sm,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        previewImage: { width: '100%', height: 400 },
        placeholder: {
          height: 280,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceSecondary,
          paddingHorizontal: theme.spacing.lg,
        },
        placeholderText: { ...theme.typography.body, color: theme.colors.textTertiary },
        placeholderHint: { ...theme.typography.small, color: theme.colors.textTertiary, marginTop: theme.spacing.xs },
        videoIcon: { fontSize: 40, color: theme.colors.textTertiary, marginBottom: theme.spacing.sm },
        videoLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, textAlign: 'center' },
        infoCard: {
          backgroundColor: theme.colors.infoLight,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderColor: theme.colors.info + '40',
          borderWidth: StyleSheet.hairlineWidth,
        },
        infoTitle: { ...theme.typography.captionMedium, color: theme.colors.info, marginBottom: theme.spacing.xs },
        infoText: { ...theme.typography.caption, color: theme.colors.text, lineHeight: 20 },
      }),
    [theme, insets.bottom],
  );

  const previewUrl = mediaUrl.trim();
  const showPreview = isHttpUrl(previewUrl);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Launch Screen"
        onBack={() => navigation.goBack()}
        right={<ActionButton label="Save" size="sm" loading={saving} onPress={handleSave} />}
      />
      {loading ? (
        <LoadingState message="Loading…" />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SectionCard title="Screen type">
            <View style={styles.typeRow}>
              {(['image', 'video'] as const).map(t => {
                const active = selectedType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, active && styles.typeBtnActive]}
                    onPress={() => setSelectedType(t)}
                    activeOpacity={0.8}>
                    <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SectionCard>

          <SectionCard title="Media URL">
            <Input
              label={`${selectedType === 'image' ? 'Image' : 'Video'} URL`}
              value={mediaUrl}
              onChangeText={setMediaUrl}
              placeholder={
                selectedType === 'image'
                  ? 'https://your-cdn.com/launch-screen.png'
                  : 'https://your-cdn.com/launch.mp4'
              }
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <ActionButton
              label={uploading ? 'Hosting…' : 'Host on app CDN'}
              variant="outline"
              size="sm"
              loading={uploading}
              onPress={handleUpload}
            />
          </SectionCard>

          <SectionCard title="Preview" padded={false}>
            <View style={styles.previewCard}>
              {showPreview && selectedType === 'image' ? (
                <Image source={{ uri: previewUrl }} style={styles.previewImage} resizeMode="contain" />
              ) : showPreview && selectedType === 'video' ? (
                <View style={styles.placeholder}>
                  <Text style={styles.videoIcon}>▶</Text>
                  <Text style={styles.videoLabel} numberOfLines={2}>
                    {previewUrl}
                  </Text>
                </View>
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>
                    {selectedType === 'image' ? 'No image set' : 'No video set'}
                  </Text>
                  <Text style={styles.placeholderHint}>Paste a public URL above to preview.</Text>
                </View>
              )}
            </View>
          </SectionCard>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Recommendations</Text>
            <Text style={styles.infoText}>
              {selectedType === 'image'
                ? 'Use a 1242×2688 PNG or JPEG. Keep file size under 2 MB for fast cold-start.'
                : 'Use a short (2–3s) MP4. Max 5 MB. Loop-friendly content works best.'}
            </Text>
            <Text style={[styles.infoText, { marginTop: theme.spacing.xs }]}>
              Host the file on a public CDN (Shopify Files, AWS S3, Cloudflare R2, etc.) and paste the URL here.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
