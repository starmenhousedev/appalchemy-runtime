import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Switch,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pushApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { AUTOMATED_PUSH_TYPES } from '../../utils/constants';
import type { AutomatedPush, AutomatedPushType } from '../../types';

const TYPE_GLYPHS: Record<AutomatedPushType, string> = {
  new_user: '✦',
  abandoned_cart: '⌃',
  back_in_stock: '↻',
  order_tracking: '⤴',
};

const TYPE_DESCRIPTIONS: Record<AutomatedPushType, string> = {
  new_user: 'Send a welcome notification when a new user installs the app.',
  abandoned_cart: 'Remind users about items left in their cart.',
  back_in_stock: 'Notify users when a wishlisted product is back in stock.',
  order_tracking: 'Send order status updates automatically.',
};

export function AutomatedPushScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [automations, setAutomations] = useState<AutomatedPush[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<AutomatedPushType | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editDelay, setEditDelay] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAutomations = useCallback(async () => {
    try {
      const data = await pushApi.listAutomated();
      setAutomations(data);
    } catch {
      showToast('error', 'Failed to load automated pushes');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  const handleToggle = async (type: AutomatedPushType) => {
    try {
      const updated = await pushApi.toggleAutomated(type);
      setAutomations(prev => prev.map(a => (a.type === type ? updated : a)));
    } catch {
      showToast('error', 'Failed to toggle automation');
    }
  };

  const startEditing = (item: AutomatedPush) => {
    setEditingType(item.type);
    setEditTitle(item.title);
    setEditMessage(item.message);
    setEditDelay(item.delay_minutes.toString());
  };

  const handleSave = async () => {
    if (!editingType) return;
    setSaving(true);
    try {
      const updated = await pushApi.updateAutomated(editingType, {
        title: editTitle.trim(),
        message: editMessage.trim(),
        delay_minutes: parseInt(editDelay, 10) || 0,
      });
      setAutomations(prev => prev.map(a => (a.type === editingType ? updated : a)));
      setEditingType(null);
      showToast('success', 'Automation updated');
    } catch {
      showToast('error', 'Failed to update automation');
    } finally {
      setSaving(false);
    }
  };

  const getTypeLabel = (type: AutomatedPushType) =>
    AUTOMATED_PUSH_TYPES.find(t => t.value === type)?.label || type;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.sm },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.shadows.sm,
        },
        cardHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
        glyphBox: {
          width: 44,
          height: 44,
          borderRadius: theme.borderRadius.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        glyphText: { fontSize: 20, fontWeight: '700' },
        cardTitle: { ...theme.typography.bodyMedium, color: theme.colors.text },
        cardDesc: { ...theme.typography.small, color: theme.colors.textTertiary, marginTop: 2 },
        previewSection: {
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
        },
        previewRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.xs },
        previewLabel: { ...theme.typography.caption, color: theme.colors.textTertiary, width: 64 },
        previewValue: { ...theme.typography.caption, color: theme.colors.text, flex: 1 },
        editLink: { ...theme.typography.captionMedium, color: theme.colors.primary, marginTop: theme.spacing.sm, alignSelf: 'flex-start' },
        editSection: {
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.md,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
          gap: theme.spacing.sm,
        },
        editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
      }),
    [theme, insets.bottom],
  );

  const renderItem = ({ item }: { item: AutomatedPush }) => {
    const isEditing = editingType === item.type;
    const accent = item.is_active ? theme.colors.primary : theme.colors.textTertiary;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.glyphBox, { backgroundColor: accent + '22' }]}>
            <Text style={[styles.glyphText, { color: accent }]}>{TYPE_GLYPHS[item.type]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{getTypeLabel(item.type)}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {TYPE_DESCRIPTIONS[item.type]}
            </Text>
          </View>
          <Switch
            value={item.is_active}
            onValueChange={() => handleToggle(item.type)}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            thumbColor={item.is_active ? theme.colors.primary : theme.colors.textTertiary}
          />
        </View>

        {isEditing ? (
          <View style={styles.editSection}>
            <Input label="Title" value={editTitle} onChangeText={setEditTitle} placeholder="Notification title" />
            <Input
              label="Message"
              value={editMessage}
              onChangeText={setEditMessage}
              placeholder="Notification message"
              multiline
              numberOfLines={3}
            />
            <Input
              label="Delay (minutes)"
              value={editDelay}
              onChangeText={setEditDelay}
              keyboardType="numeric"
              placeholder="0"
            />
            <View style={styles.editActions}>
              <ActionButton label="Cancel" variant="ghost" size="sm" onPress={() => setEditingType(null)} />
              <ActionButton label="Save" size="sm" loading={saving} onPress={handleSave} />
            </View>
          </View>
        ) : (
          <View style={styles.previewSection}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Title</Text>
              <Text style={styles.previewValue} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Message</Text>
              <Text style={styles.previewValue} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Delay</Text>
              <Text style={styles.previewValue}>{item.delay_minutes} min</Text>
            </View>
            <TouchableOpacity onPress={() => startEditing(item)}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Automated Push" onBack={() => navigation.goBack()} />
      {loading ? (
        <LoadingState message="Loading automations…" />
      ) : (
        <FlatList
          data={automations}
          keyExtractor={item => item.type}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchAutomations}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="⌘"
              title="No automations configured"
              description="Automated push notifications will appear here once configured by the system."
            />
          }
        />
      )}
    </View>
  );
}
