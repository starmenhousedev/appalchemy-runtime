import React, { useEffect, useState, useCallback } from 'react';
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
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { AUTOMATED_PUSH_TYPES } from '../../utils/constants';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import type { AutomatedPush, AutomatedPushType } from '../../types';

const TYPE_ICONS: Record<AutomatedPushType, string> = {
  new_user: 'U',
  abandoned_cart: 'C',
  back_in_stock: 'S',
  order_tracking: 'T',
};

const TYPE_DESCRIPTIONS: Record<AutomatedPushType, string> = {
  new_user: 'Send a welcome notification when a new user installs the app.',
  abandoned_cart: 'Remind users about items left in their cart.',
  back_in_stock: 'Notify users when a wishlisted product is back in stock.',
  order_tracking: 'Send order status updates automatically.',
};

export function AutomatedPushScreen({ navigation }: { navigation: any }) {
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
  }, []);

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

  const cancelEditing = () => {
    setEditingType(null);
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

  const renderItem = ({ item }: { item: AutomatedPush }) => {
    const isEditing = editingType === item.type;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, item.is_active && styles.iconBoxActive]}>
            <Text style={[styles.iconText, item.is_active && styles.iconTextActive]}>
              {TYPE_ICONS[item.type]}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{getTypeLabel(item.type)}</Text>
            <Text style={styles.cardDesc}>{TYPE_DESCRIPTIONS[item.type]}</Text>
          </View>
          <Switch
            value={item.is_active}
            onValueChange={() => handleToggle(item.type)}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={item.is_active ? colors.primary : colors.textTertiary}
          />
        </View>

        {isEditing ? (
          <View style={styles.editSection}>
            <Input
              label="Title"
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Notification title"
            />
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
              <Button title="Cancel" onPress={cancelEditing} variant="ghost" size="sm" />
              <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
            </View>
          </View>
        ) : (
          <View style={styles.previewSection}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Title:</Text>
              <Text style={styles.previewValue} numberOfLines={1}>{item.title}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Message:</Text>
              <Text style={styles.previewValue} numberOfLines={2}>{item.message}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Delay:</Text>
              <Text style={styles.previewValue}>{item.delay_minutes} min</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => startEditing(item)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Automated Push</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={automations}
        keyExtractor={item => item.type}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAutomations} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No automations configured</Text>
              <Text style={styles.emptySubtitle}>
                Automated push notifications will appear here once configured by the system.
              </Text>
            </View>
          ) : null
        }
      />
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
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center', alignItems: 'center',
  },
  iconBoxActive: { backgroundColor: colors.primary + '15' },
  iconText: { ...typography.h4, color: colors.textTertiary },
  iconTextActive: { color: colors.primary },
  cardInfo: { flex: 1 },
  cardTitle: { ...typography.bodyMedium, color: colors.text },
  cardDesc: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  previewSection: {
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  previewRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  previewLabel: { ...typography.caption, color: colors.textTertiary, width: 60 },
  previewValue: { ...typography.caption, color: colors.text, flex: 1 },
  editButton: { marginTop: spacing.sm, alignSelf: 'flex-start' },
  editButtonText: { ...typography.captionMedium, color: colors.primary },
  editSection: {
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  editActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm,
  },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
