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
import { usersApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { USER_ROLES } from '../../utils/constants';
import type { User } from '../../types';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  owner: { bg: colors.primary + '15', text: colors.primary },
  admin: { bg: colors.warning + '20', text: colors.warning },
  editor: { bg: colors.info + '20', text: colors.info },
  viewer: { bg: colors.surfaceSecondary, text: colors.textTertiary },
};

export function ManageUsersScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const getRoleLabel = (role: string) =>
    USER_ROLES.find(r => r.value === role)?.label || role;

  const renderItem = ({ item }: { item: User }) => {
    const roleColor = ROLE_COLORS[item.role] || ROLE_COLORS.viewer;

    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.name}</Text>
            {!item.is_active && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactive</Text>
              </View>
            )}
          </View>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
            <Text style={[styles.roleBadgeText, { color: roleColor.text }]}>
              {getRoleLabel(item.role)}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserForm', { userId: item.id })}
            style={styles.actionBtn}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          {item.role !== 'owner' && (
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Team Members</Text>
        <Button title="+ Invite" onPress={() => navigation.navigate('UserForm')} size="sm" />
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchUsers} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No team members</Text>
              <Text style={styles.emptySubtitle}>Invite team members to collaborate on your app.</Text>
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
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { ...typography.h4, color: colors.primary },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userName: { ...typography.bodyMedium, color: colors.text },
  userEmail: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  roleBadge: {
    alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.sm, marginTop: spacing.xs,
  },
  roleBadgeText: { ...typography.small, fontWeight: '600', textTransform: 'capitalize' },
  inactiveBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 1,
    borderRadius: borderRadius.sm, backgroundColor: colors.error + '15',
  },
  inactiveBadgeText: { ...typography.small, color: colors.error },
  cardActions: { gap: spacing.sm },
  actionBtn: { paddingVertical: spacing.xs },
  editText: { ...typography.captionMedium, color: colors.primary },
  deleteText: { ...typography.captionMedium, color: colors.error },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
