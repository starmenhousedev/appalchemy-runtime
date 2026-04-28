import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appLinksApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import type { AppLink } from '../../types';

export function AppLinksScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [deeplinks, setDeeplinks] = useState<AppLink[]>([]);
  const [onelinks, setOnelinks] = useState<AppLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'deeplink' | 'onelink'>('deeplink');
  const [formTitle, setFormTitle] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<AppLink | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const [dl, ol] = await Promise.all([
        appLinksApi.listDeeplinks(),
        appLinksApi.listOnelinks(),
      ]);
      setDeeplinks(Array.isArray(dl) ? dl : []);
      setOnelinks(Array.isArray(ol) ? ol : []);
    } catch {
      showToast('error', 'Failed to load app links');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formTargetUrl.trim()) {
      showToast('error', 'Title and target URL are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { title: formTitle.trim(), target_url: formTargetUrl.trim(), config: {} };
      if (formType === 'deeplink') {
        await appLinksApi.createDeeplink(payload);
      } else {
        await appLinksApi.createOnelink(payload);
      }
      setShowForm(false);
      setFormTitle('');
      setFormTargetUrl('');
      fetchLinks();
      showToast('success', 'Link created');
    } catch {
      showToast('error', 'Failed to create link');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDetail = async (item: AppLink) => {
    if (item.type !== 'deeplink') {
      setDetail(item);
      return;
    }
    setDetailLoading(true);
    setDetail(item);
    try {
      const full = await appLinksApi.getDeeplink(item.id);
      if (full) setDetail(full);
    } catch {
      // Show what we already have
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Link', 'Remove this link?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await appLinksApi.deleteDeeplink(id);
            setDeeplinks(prev => prev.filter(l => l.id !== id));
            showToast('success', 'Link deleted');
          } catch {
            showToast('error', 'Failed to delete link');
          }
        },
      },
    ]);
  };

  const sections = useMemo(
    () => [
      { title: 'Deep Links', data: deeplinks, type: 'deeplink' as const },
      { title: 'One Links', data: onelinks, type: 'onelink' as const },
    ],
    [deeplinks, onelinks],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom },
        sectionHeader: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
        },
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.shadows.sm,
        },
        linkTitle: { ...theme.typography.bodyMedium, color: theme.colors.text },
        linkUrl: { ...theme.typography.small, color: theme.colors.primary, marginTop: 2 },
        linkTarget: { ...theme.typography.small, color: theme.colors.textTertiary, marginTop: 2 },
        deleteText: { ...theme.typography.captionMedium, color: theme.colors.error, paddingHorizontal: theme.spacing.sm },
        modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
        modalContent: {
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: theme.borderRadius.xl,
          borderTopRightRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          paddingBottom: theme.spacing.xl + insets.bottom,
        },
        modalTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.lg },
        fieldLabel: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.xs,
        },
        typeRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg },
        typeBtn: {
          flex: 1,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1.5,
          borderColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surfaceSecondary,
          alignItems: 'center',
        },
        typeBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
        typeBtnText: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        typeBtnTextActive: { color: theme.colors.primary },
        modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.lg },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="App Links"
        onBack={() => navigation.goBack()}
        right={<ActionButton label="+ New" size="sm" onPress={() => setShowForm(true)} />}
      />
      {loading ? (
        <LoadingState message="Loading links…" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleOpenDetail(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.url ? (
                  <Text style={styles.linkUrl} numberOfLines={1}>
                    {item.url}
                  </Text>
                ) : null}
                <Text style={styles.linkTarget} numberOfLines={1}>
                  {item.target_url}
                </Text>
              </View>
              {item.type === 'deeplink' ? (
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          )}
          renderSectionFooter={({ section }) =>
            section.data.length === 0 && !loading ? (
              <EmptyState
                icon="⤴"
                title={`No ${section.title.toLowerCase()} yet`}
                description="Create one to direct users to specific content."
                compact
              />
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchLinks} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
          }
        />
      )}

      <Modal
        visible={!!detail}
        transparent
        animationType="fade"
        onRequestClose={() => setDetail(null)}>
        <View style={[styles.modalOverlay, { justifyContent: 'center' }]}>
          <View
            style={[
              styles.modalContent,
              {
                marginHorizontal: theme.spacing.lg,
                borderRadius: theme.borderRadius.lg,
                paddingBottom: theme.spacing.xl,
              },
            ]}>
            <Text style={styles.modalTitle}>{detail?.title || 'Link'}</Text>
            {detailLoading ? (
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Loading details…
              </Text>
            ) : detail ? (
              <View style={{ gap: theme.spacing.xs }}>
                <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary }]}>
                  Type
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.text }]}>{detail.type}</Text>
                {detail.url ? (
                  <>
                    <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary, marginTop: theme.spacing.sm }]}>
                      Public URL
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.primary }]}>{detail.url}</Text>
                  </>
                ) : null}
                <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary, marginTop: theme.spacing.sm }]}>
                  Target
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.text }]}>{detail.target_url}</Text>
                {detail.config && Object.keys(detail.config as Record<string, unknown>).length > 0 ? (
                  <>
                    <Text style={[theme.typography.captionMedium, { color: theme.colors.textSecondary, marginTop: theme.spacing.sm }]}>
                      Config
                    </Text>
                    <Text style={[theme.typography.small, { color: theme.colors.textTertiary, fontFamily: 'monospace' }]}>
                      {JSON.stringify(detail.config, null, 2)}
                    </Text>
                  </>
                ) : null}
              </View>
            ) : null}
            <View style={[styles.modalActions, { marginTop: theme.spacing.lg }]}>
              <ActionButton label="Close" variant="ghost" onPress={() => setDetail(null)} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Link</Text>
            <Text style={styles.fieldLabel}>Link type</Text>
            <View style={styles.typeRow}>
              {(['deeplink', 'onelink'] as const).map(t => {
                const active = formType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, active && styles.typeBtnActive]}
                    onPress={() => setFormType(t)}>
                    <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                      {t === 'deeplink' ? 'Deep Link' : 'One Link'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Input label="Title" value={formTitle} onChangeText={setFormTitle} placeholder="e.g. Summer Sale Page" />
            <Input
              label="Target URL"
              value={formTargetUrl}
              onChangeText={setFormTargetUrl}
              placeholder="https://yourstore.com/collections/sale"
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={styles.modalActions}>
              <ActionButton label="Cancel" variant="ghost" onPress={() => setShowForm(false)} />
              <ActionButton label="Create" loading={saving} onPress={handleCreate} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
