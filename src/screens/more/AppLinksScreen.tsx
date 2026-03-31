import React, { useEffect, useState, useCallback } from 'react';
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
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { AppLink } from '../../types';

export function AppLinksScreen({ navigation }: { navigation: any }) {
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

  const fetchLinks = useCallback(async () => {
    try {
      const [dl, ol] = await Promise.all([
        appLinksApi.listDeeplinks(),
        appLinksApi.listOnelinks(),
      ]);
      setDeeplinks(dl);
      setOnelinks(ol);
    } catch {
      showToast('error', 'Failed to load app links');
    } finally {
      setLoading(false);
    }
  }, []);

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
      const payload = {
        title: formTitle.trim(),
        target_url: formTargetUrl.trim(),
        config: {},
      };
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

  const sections = [
    { title: 'Deep Links', data: deeplinks, type: 'deeplink' as const },
    { title: 'One Links', data: onelinks, type: 'onelink' as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>App Links</Text>
        <Button title="+ New" onPress={() => setShowForm(true)} size="sm" />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.linkTitle}>{item.title}</Text>
              {item.url && <Text style={styles.linkUrl} numberOfLines={1}>{item.url}</Text>}
              <Text style={styles.linkTarget} numberOfLines={1}>{item.target_url}</Text>
            </View>
            {item.type === 'deeplink' && (
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchLinks} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No app links</Text>
              <Text style={styles.emptySubtitle}>Create deep links to direct users to specific content in your app.</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Link</Text>

            <Text style={styles.fieldLabel}>LINK TYPE</Text>
            <View style={styles.typeRow}>
              {(['deeplink', 'onelink'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, formType === t && styles.typeBtnActive]}
                  onPress={() => setFormType(t)}>
                  <Text style={[styles.typeBtnText, formType === t && styles.typeBtnTextActive]}>
                    {t === 'deeplink' ? 'Deep Link' : 'One Link'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Title" value={formTitle} onChangeText={setFormTitle} placeholder="e.g. Summer Sale Page" />
            <Input label="Target URL" value={formTargetUrl} onChangeText={setFormTargetUrl} placeholder="https://yourstore.com/collections/sale" />

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setShowForm(false)} variant="ghost" />
              <Button title="Create" onPress={handleCreate} loading={saving} />
            </View>
          </View>
        </View>
      </Modal>
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
  list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionHeader: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.sm, ...shadows.sm,
  },
  cardInfo: { flex: 1 },
  linkTitle: { ...typography.bodyMedium, color: colors.text },
  linkUrl: { ...typography.small, color: colors.primary, marginTop: 2 },
  linkTarget: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  deleteBtn: { padding: spacing.sm },
  deleteBtnText: { ...typography.captionMedium, color: colors.error },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl, padding: spacing.xl,
  },
  modalTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  fieldLabel: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs,
  },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  typeBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  typeBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  typeBtnText: { ...typography.captionMedium, color: colors.textSecondary },
  typeBtnTextActive: { color: colors.primary },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.lg },
});
