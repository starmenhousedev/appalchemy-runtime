import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usersApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { USER_ROLES } from '../../utils/constants';
import type { User } from '../../types';
import type { StatusTone } from '../../components/common/StatusBadge';

const ROLE_TONE: Record<string, StatusTone> = {
  owner: 'primary',
  admin: 'warning',
  editor: 'info',
  viewer: 'neutral',
};

export function ManageUsersScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await usersApi.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = (user: User) => {
    if (user.role === 'owner') {
      showToast('error', 'Cannot delete the owner');
      return;
    }
    Alert.alert('Remove User', `Remove ${user.name} from the team?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await usersApi.delete(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            showToast('success', 'User removed');
          } catch {
            showToast('error', 'Failed to remove user');
          }
        },
      },
    ]);
  };

  const getRoleLabel = (role: string) => USER_ROLES.find(r => r.value === role)?.label || role;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.sm },
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
          ...theme.shadows.sm,
        },
        avatar: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.colors.primarySoft,
          justifyContent: 'center',
          alignItems: 'center',
        },
        avatarText: { ...theme.typography.h4, color: theme.colors.primary },
        nameRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'wrap' },
        name: { ...theme.typography.bodyMedium, color: theme.colors.text },
        email: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: 2 },
        actions: { gap: theme.spacing.xs, alignItems: 'flex-end' },
        editLink: { ...theme.typography.captionMedium, color: theme.colors.primary, paddingVertical: 4 },
        deleteLink: { ...theme.typography.captionMedium, color: theme.colors.error, paddingVertical: 4 },
      }),
    [theme, insets.bottom],
  );

  const renderItem = ({ item }: { item: User }) => {
    const tone = ROLE_TONE[item.role] || 'neutral';
    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            {!item.is_active && <StatusBadge label="Inactive" tone="error" />}
          </View>
          <Text style={styles.email} numberOfLines={1}>
            {item.email}
          </Text>
          <View style={{ marginTop: 6 }}>
            <StatusBadge label={getRoleLabel(item.role)} tone={tone} />
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => navigation.navigate('UserForm', { userId: item.id })}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
          {item.role !== 'owner' ? (
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Text style={styles.deleteLink}>Remove</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Team Members"
        subtitle={`${users.length} member${users.length === 1 ? '' : 's'}`}
        onBack={() => navigation.goBack()}
        right={<ActionButton label="+ Invite" size="sm" onPress={() => navigation.navigate('UserForm')} />}
      />
      {loading ? (
        <LoadingState message="Loading team…" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchUsers} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="◉"
              title="No team members"
              description="Invite team members to collaborate on your app."
              actionLabel="Invite member"
              onAction={() => navigation.navigate('UserForm')}
            />
          }
        />
      )}
    </View>
  );
}
