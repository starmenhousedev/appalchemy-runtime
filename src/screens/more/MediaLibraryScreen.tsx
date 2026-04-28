import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mediaApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { Media } from '../../types';

const PAGE_SIZE = 24;

const isImage = (mime: string | null | undefined) =>
  !!mime && mime.toLowerCase().startsWith('image/');

const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const guessMimeFromUrl = (url: string): string => {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.mp4')) return 'video/mp4';
  if (clean.endsWith('.mov')) return 'video/quicktime';
  if (clean.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
};

export function MediaLibraryScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);

  const fetchPage = useCallback(
    async (nextPage: number, replace = false) => {
      try {
        const data = await mediaApi.list({ page: nextPage, limit: PAGE_SIZE });
        const list = Array.isArray(data?.data) ? data.data : [];
        const totalPages = data?.pagination?.totalPages ?? 1;
        setItems(prev => (replace ? list : [...prev, ...list]));
        setPage(nextPage);
        setHasMore(nextPage < totalPages);
      } catch {
        showToast('error', 'Failed to load media');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPage(1, true);
  };

  const handleEndReached = () => {
    if (!loading && hasMore) {
      fetchPage(page + 1);
    }
  };

  const handleUpload = async () => {
    const url = uploadUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      showToast('error', 'Enter a public http(s) URL to import');
      return;
    }
    setUploading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Source URL returned ' + res.status);
      }
      const blob = await res.blob();
      const guessedMime = blob.type || guessMimeFromUrl(url);
      const filename = url.split('/').pop()?.split('?')[0] || `upload-${Date.now()}`;

      const formData = new FormData();
      formData.append('file', {
        uri: url,
        name: filename,
        type: guessedMime,
      } as unknown as Blob);
      if (uploadAlt.trim()) formData.append('alt_text', uploadAlt.trim());

      const created = await mediaApi.upload(formData);
      if (created) {
        setItems(prev => [created, ...prev]);
      } else {
        fetchPage(1, true);
      }
      setShowUpload(false);
      setUploadUrl('');
      setUploadAlt('');
      showToast('success', 'Media uploaded');
    } catch (err: any) {
      showToast('error', err?.message ? `Upload failed: ${err.message}` : 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (item: Media) => {
    Alert.alert('Delete media', `Permanently delete "${item.original_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await mediaApi.delete(item.id);
            setItems(prev => prev.filter(m => m.id !== item.id));
            if (selected?.id === item.id) setSelected(null);
            showToast('success', 'Media deleted');
          } catch {
            showToast('error', 'Failed to delete media');
          }
        },
      },
    ]);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        list: {
          padding: theme.spacing.md,
          paddingBottom: theme.spacing.xxxl + insets.bottom,
        },
        column: { gap: theme.spacing.sm },
        tile: {
          flex: 1,
          margin: theme.spacing.xs,
          aspectRatio: 1,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.borderLight,
          overflow: 'hidden',
        },
        tileImage: { width: '100%', height: '100%' },
        tileFallback: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.surfaceSecondary,
        },
        tileFallbackText: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        tileMime: { ...theme.typography.small, color: theme.colors.textTertiary, marginTop: 4 },
        tileFooter: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          paddingVertical: 4,
          paddingHorizontal: 6,
        },
        tileFooterText: { ...theme.typography.small, color: '#fff' },
        modalOverlay: {
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: 'center',
          padding: theme.spacing.lg,
        },
        modalCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          ...theme.shadows.lg,
        },
        modalTitle: { ...theme.typography.h4, color: theme.colors.text, marginBottom: theme.spacing.xs },
        modalSubtitle: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
        modalActions: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: theme.spacing.sm,
          marginTop: theme.spacing.md,
        },
        detailImage: {
          width: '100%',
          height: 220,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surfaceSecondary,
        },
        detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
        detailKey: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        detailVal: {
          ...theme.typography.caption,
          color: theme.colors.text,
          flex: 1,
          textAlign: 'right',
          marginLeft: theme.spacing.md,
        },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Media Library"
        subtitle={`${items.length} item${items.length === 1 ? '' : 's'}`}
        onBack={() => navigation.goBack()}
        right={<ActionButton label="+ Upload" size="sm" onPress={() => setShowUpload(true)} />}
      />

      {loading ? (
        <LoadingState message="Loading media…" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          numColumns={3}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.column}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
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
              icon="◇"
              title="No media yet"
              description="Upload images, videos and other assets to use across your storefront."
              actionLabel="Upload media"
              onAction={() => setShowUpload(true)}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tile}
              activeOpacity={0.85}
              onPress={() => setSelected(item)}>
              {isImage(item.mime_type) ? (
                <Image source={{ uri: item.url }} style={styles.tileImage} resizeMode="cover" />
              ) : (
                <View style={styles.tileFallback}>
                  <Text style={styles.tileFallbackText} numberOfLines={1}>
                    {item.original_name}
                  </Text>
                  <Text style={styles.tileMime}>{item.mime_type || 'unknown'}</Text>
                </View>
              )}
              <View style={styles.tileFooter}>
                <Text style={styles.tileFooterText} numberOfLines={1}>
                  {formatBytes(item.size)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={showUpload}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpload(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upload media</Text>
            <Text style={styles.modalSubtitle}>
              Paste a public URL — we'll fetch the file and store it in your library.
            </Text>
            <Input
              label="Source URL"
              value={uploadUrl}
              onChangeText={setUploadUrl}
              placeholder="https://cdn.example.com/banner.jpg"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Input
              label="Alt text (optional)"
              value={uploadAlt}
              onChangeText={setUploadAlt}
              placeholder="Describe the asset"
            />
            <View style={styles.modalActions}>
              <ActionButton label="Cancel" variant="ghost" onPress={() => setShowUpload(false)} />
              <ActionButton label="Upload" loading={uploading} onPress={handleUpload} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selected ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selected.original_name}
                </Text>
                <View style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                  <StatusBadge label={selected.mime_type || 'unknown'} tone="info" />
                </View>
                {isImage(selected.mime_type) ? (
                  <Image
                    source={{ uri: selected.url }}
                    style={styles.detailImage}
                    resizeMode="contain"
                  />
                ) : null}
                <View style={{ marginTop: theme.spacing.md }}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Filename</Text>
                    <Text style={styles.detailVal} numberOfLines={1}>
                      {selected.filename}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Size</Text>
                    <Text style={styles.detailVal}>{formatBytes(selected.size)}</Text>
                  </View>
                  {selected.alt_text ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Alt text</Text>
                      <Text style={styles.detailVal}>{selected.alt_text}</Text>
                    </View>
                  ) : null}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Uploaded</Text>
                    <Text style={styles.detailVal}>
                      {new Date(selected.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalActions}>
                  <ActionButton
                    label="Open"
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      Linking.openURL(selected.url).catch(() =>
                        showToast('error', 'Could not open URL'),
                      )
                    }
                  />
                  <ActionButton
                    label="Delete"
                    variant="danger"
                    size="sm"
                    onPress={() => handleDelete(selected)}
                  />
                  <ActionButton
                    label="Close"
                    variant="ghost"
                    size="sm"
                    onPress={() => setSelected(null)}
                  />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
