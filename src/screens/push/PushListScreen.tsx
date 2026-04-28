import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { pushApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterChips } from '../../components/common/FilterChips';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import type { PushNotification } from '../../types';
import type { DrawerParamList } from '../../navigation/types';
import type { StatusTone } from '../../components/common/StatusBadge';

type Tab = 'scheduled' | 'sent' | 'automated';

const STATUS_TONE: Record<string, StatusTone> = {
  draft: 'neutral',
  scheduled: 'warning',
  sent: 'success',
  failed: 'error',
};

export function PushListScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const drawerNav = navigation.getParent() as DrawerNavigationProp<DrawerParamList> | undefined;

  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('scheduled');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pushApi.list(tab);
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [tab, showToast]);

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
      await pushApi.clone(id);
      showToast('success', 'Notification cloned');
      setTab('scheduled');
    } catch {
      showToast('error', 'Failed to clone');
    }
  };

  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        toolbar: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.sm },
        list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.sm },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.shadows.sm,
        },
        cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm },
        title: { ...theme.typography.bodyMedium, color: theme.colors.text, flex: 1 },
        message: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
        metricsRow: {
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
        },
        metric: { flex: 1, alignItems: 'flex-start' },
        metricValue: { ...theme.typography.h4, color: theme.colors.text },
        metricLabel: { ...theme.typography.small, color: theme.colors.textTertiary, marginTop: 2 },
        actionsRow: {
          flexDirection: 'row',
          gap: theme.spacing.lg,
          marginTop: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.colors.divider,
        },
        actionLink: { ...theme.typography.captionMedium, color: theme.colors.primary, paddingVertical: 4 },
        dangerLink: { ...theme.typography.captionMedium, color: theme.colors.error, paddingVertical: 4 },
      }),
    [theme, insets.bottom],
  );

  const renderItem = ({ item }: { item: PushNotification }) => {
    const status = item.status || 'draft';
    const tone: StatusTone = STATUS_TONE[status] ?? 'neutral';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title || 'Untitled notification'}
          </Text>
          <StatusBadge label={status} tone={tone} dot />
        </View>
        {item.message ? (
          <Text style={styles.message} numberOfLines={3}>
            {item.message}
          </Text>
        ) : null}
        {tab === 'sent' && (
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{num(item.total_sent)}</Text>
              <Text style={styles.metricLabel}>Sent</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{num(item.total_clicked)}</Text>
              <Text style={styles.metricLabel}>Clicked</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{num(item.total_orders)}</Text>
              <Text style={styles.metricLabel}>Orders</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>${num(item.total_revenue)}</Text>
              <Text style={styles.metricLabel}>Revenue</Text>
            </View>
          </View>
        )}
        <View style={styles.actionsRow}>
          {tab === 'scheduled' ? (
            <>
              <TouchableOpacity onPress={() => navigation.navigate('PushForm', { notificationId: item.id })}>
                <Text style={styles.actionLink}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.dangerLink}>Delete</Text>
              </TouchableOpacity>
            </>
          ) : null}
          {tab === 'sent' ? (
            <TouchableOpacity onPress={() => handleClone(item.id)}>
              <Text style={styles.actionLink}>Clone</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Push Notifications"
        subtitle={`${notifications.length} ${tab}`}
        onMenu={() => drawerNav?.openDrawer()}
        right={<ActionButton label="+ New" onPress={() => navigation.navigate('PushForm')} size="sm" />}
      />

      <View style={styles.toolbar}>
        <FilterChips
          value={tab}
          onChange={v => setTab(v as Tab)}
          options={[
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Sent', value: 'sent' },
            { label: 'Automated', value: 'automated' },
          ]}
        />
      </View>

      {loading && notifications.length === 0 ? (
        <LoadingState message="Loading notifications…" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchNotifications}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                icon="⌘"
                title={
                  tab === 'scheduled'
                    ? 'No scheduled campaigns'
                    : tab === 'sent'
                    ? 'No sent campaigns yet'
                    : 'No automations configured'
                }
                description={
                  tab === 'scheduled'
                    ? 'Schedule a push notification to engage your users.'
                    : tab === 'sent'
                    ? 'Past campaigns will appear here.'
                    : 'Set up automated notifications for cart abandonment, win-back, and more.'
                }
                actionLabel={tab === 'automated' ? 'Configure automations' : 'Create notification'}
                onAction={() =>
                  tab === 'automated'
                    ? navigation.navigate('AutomatedPush')
                    : navigation.navigate('PushForm')
                }
              />
            ) : null
          }
        />
      )}
    </View>
  );
}
