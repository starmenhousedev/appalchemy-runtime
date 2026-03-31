import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pushApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import type { PushNotification } from '../../types';

type Tab = 'scheduled' | 'sent' | 'automated';

function PushCard({
  notification,
  tab,
  onEdit,
  onClone,
  onDelete,
}: {
  notification: PushNotification;
  tab: Tab;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}) {
  const statusColors: Record<string, string> = {
    draft: colors.textTertiary,
    scheduled: colors.warning,
    sent: colors.success,
    failed: colors.error,
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{notification.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: (statusColors[notification.status] || colors.textTertiary) + '20' },
          ]}>
          <Text
            style={[
              styles.statusText,
              { color: statusColors[notification.status] || colors.textTertiary },
            ]}>
            {notification.status}
          </Text>
        </View>
      </View>

      <Text style={styles.cardMessage} numberOfLines={2}>
        {notification.message}
      </Text>

      {tab === 'sent' && (
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{notification.total_sent}</Text>
            <Text style={styles.metricLabel}>Sent</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{notification.total_clicked}</Text>
            <Text style={styles.metricLabel}>Clicked</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{notification.total_orders}</Text>
            <Text style={styles.metricLabel}>Orders</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>
              ${notification.total_revenue}
            </Text>
            <Text style={styles.metricLabel}>Revenue</Text>
          </View>
        </View>
      )}

      <View style={styles.cardActions}>
        {tab === 'scheduled' && (
          <>
            <TouchableOpacity onPress={onEdit}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Text style={[styles.actionText, { color: colors.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </>
        )}
        {tab === 'sent' && (
          <TouchableOpacity onPress={onClone}>
            <Text style={styles.actionText}>Clone</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function PushListScreen({ navigation }: { navigation: any }) {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('scheduled');
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pushApi.list(tab);
      setNotifications(data);
    } catch {
      showToast('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Notification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await pushApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            showToast('success', 'Notification deleted');
          } catch {
            showToast('error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleClone = async (id: number) => {
    try {
      const cloned = await pushApi.clone(id);
      showToast('success', 'Notification cloned');
      setTab('scheduled');
    } catch {
      showToast('error', 'Failed to clone');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>|||</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Push Notifications</Text>
        <Button
          title="+ New"
          onPress={() => navigation.navigate('PushForm')}
          size="sm"
        />
      </View>

      <View style={styles.tabRow}>
        {(['scheduled', 'sent', 'automated'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabButton, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text
              style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <PushCard
            notification={item}
            tab={tab}
            onEdit={() => navigation.navigate('PushForm', { notificationId: item.id })}
            onClone={() => handleClone(item.id)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>
                {tab === 'scheduled'
                  ? 'Schedule a push notification to engage your users'
                  : tab === 'sent'
                  ? 'No sent notifications yet'
                  : 'Configure automated push notifications'}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  menuButton: {
    width: 36, height: 36, borderRadius: borderRadius.md,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadows.sm,
  },
  menuIcon: { fontSize: 16, color: colors.text, letterSpacing: -2 },
  headerTitle: { ...typography.h2, color: colors.text, flex: 1 },
  tabRow: {
    flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md,
  },
  tabButton: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: borderRadius.round, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { ...typography.captionMedium, color: colors.textSecondary },
  tabTextActive: { color: colors.textInverse },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm,
  },
  cardTitle: { ...typography.h4, color: colors.text, flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  statusText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize' },
  cardMessage: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  metricsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { ...typography.bodyMedium, color: colors.text },
  metricLabel: { ...typography.small, color: colors.textTertiary },
  cardActions: {
    flexDirection: 'row', gap: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm,
  },
  actionText: { ...typography.captionMedium, color: colors.primary },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
