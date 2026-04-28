import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usersApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import { USER_ROLES } from '../../utils/constants';
import type { UserRole, RolePermissionMap } from '../../types';

export function UserFormScreen({
  route,
  navigation,
}: {
  route: { params?: { userId?: number } };
  navigation: any;
}) {
  const userId = route.params?.userId;
  const isEditing = !!userId;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMap>({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const map = await usersApi.getRoles();
        setRolePermissions(map ?? {});
      } catch {
        // Roles map is optional; fall back to defaults
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await usersApi.get(userId);
        setName(data.name);
        setEmail(data.email);
        setRole(data.role);
        setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
      } catch {
        showToast('error', 'Failed to load user');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const knownPermissions = useMemo(() => {
    const all = new Set<string>(permissions);
    Object.values(rolePermissions).forEach(list => list.forEach(p => all.add(p)));
    return Array.from(all).sort();
  }, [rolePermissions, permissions]);

  const togglePermission = (key: string) => {
    setPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key],
    );
  };

  const handleSavePermissions = async () => {
    if (!userId) return;
    setSavingPermissions(true);
    try {
      const updated = await usersApi.updatePermissions(userId, permissions);
      setPermissions(Array.isArray(updated.permissions) ? updated.permissions : permissions);
      showToast('success', 'Permissions updated');
    } catch {
      showToast('error', 'Failed to update permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Name and email are required');
      return;
    }
    if (!isEditing && !password.trim()) {
      showToast('error', 'Password is required for new users');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await usersApi.update(userId!, { name: name.trim(), email: email.trim(), role });
        showToast('success', 'User updated');
      } else {
        await usersApi.create({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
        });
        showToast('success', 'User invited');
      }
      navigation.goBack();
    } catch {
      showToast('error', `Failed to ${isEditing ? 'update' : 'create'} user`);
    } finally {
      setSaving(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        form: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.md },
        sectionTitle: {
          ...theme.typography.captionMedium,
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.sm,
        },
        roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
        roleCard: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm + 2,
          borderRadius: theme.borderRadius.md,
          borderWidth: 1.5,
          borderColor: theme.colors.borderLight,
          backgroundColor: theme.colors.surface,
        },
        roleCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
        roleLabel: { ...theme.typography.captionMedium, color: theme.colors.textSecondary },
        roleLabelActive: { color: theme.colors.primary },
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={isEditing ? 'Edit User' : 'Invite User'}
        onBack={() => navigation.goBack()}
        right={<ActionButton label="Save" size="sm" loading={saving} onPress={handleSave} />}
      />
      {loading ? (
        <LoadingState message="Loading…" />
      ) : (
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Input label="Name" value={name} onChangeText={setName} placeholder="Full name" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="user@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {!isEditing && (
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Temporary password"
              secureTextEntry
            />
          )}
          <Text style={styles.sectionTitle}>Role</Text>
          <View style={styles.roleGrid}>
            {USER_ROLES.map(r => {
              const active = role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleCard, active && styles.roleCardActive]}
                  onPress={() => setRole(r.value as UserRole)}>
                  <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Role Permissions</Text>
            <Text style={styles.infoText}>
              {role === 'owner' && 'Full access to all features. Cannot be modified.'}
              {role === 'admin' && 'Full access except billing and user management.'}
              {role === 'editor' && 'Can edit themes, pages, sections, and discounts.'}
              {role === 'viewer' && 'Read-only access to all features.'}
            </Text>
            {rolePermissions[role] && rolePermissions[role].length > 0 ? (
              <Text style={[styles.infoText, { marginTop: theme.spacing.xs, fontFamily: 'monospace' }]}>
                {rolePermissions[role].join(', ')}
              </Text>
            ) : null}
          </View>

          {isEditing && knownPermissions.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Custom Permissions</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }]}>
                Override the role default by toggling specific permissions.
              </Text>
              <View style={styles.roleGrid}>
                {knownPermissions.map(p => {
                  const active = permissions.includes(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.roleCard, active && styles.roleCardActive]}
                      onPress={() => togglePermission(p)}>
                      <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>{p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <ActionButton
                label="Save permissions"
                onPress={handleSavePermissions}
                loading={savingPermissions}
                fullWidth
                style={{ marginTop: theme.spacing.sm }}
              />
            </>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
