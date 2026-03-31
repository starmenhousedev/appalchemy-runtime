import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usersApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { USER_ROLES } from '../../utils/constants';
import type { UserRole } from '../../types';

export function UserFormScreen({
  route,
  navigation,
}: {
  route: { params?: { userId?: number } };
  navigation: any;
}) {
  const userId = route.params?.userId;
  const isEditing = !!userId;
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');

  useEffect(() => {
    if (userId) loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const data = await usersApi.get(userId!);
      setName(data.name);
      setEmail(data.email);
      setRole(data.role);
    } catch {
      showToast('error', 'Failed to load user');
      navigation.goBack();
    } finally {
      setLoading(false);
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

  if (loading) return <LoadingOverlay fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>{isEditing ? 'Edit User' : 'Invite User'}</Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Input label="Name" value={name} onChangeText={setName} placeholder="Full name" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="user@example.com" keyboardType="email-address" autoCapitalize="none" />
        {!isEditing && (
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Temporary password" secureTextEntry />
        )}

        <Text style={styles.sectionTitle}>ROLE</Text>
        <View style={styles.roleGrid}>
          {USER_ROLES.map(r => (
            <TouchableOpacity
              key={r.value}
              style={[styles.roleCard, role === r.value && styles.roleCardActive]}
              onPress={() => setRole(r.value as UserRole)}>
              <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Role Permissions</Text>
          <Text style={styles.infoText}>
            {role === 'owner' && 'Full access to all features. Cannot be modified.'}
            {role === 'admin' && 'Full access except billing and user management.'}
            {role === 'editor' && 'Can edit themes, pages, sections, and discounts.'}
            {role === 'viewer' && 'Read-only access to all features.'}
          </Text>
        </View>
      </ScrollView>
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
  form: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  sectionTitle: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.md,
  },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  roleCard: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  roleCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  roleLabel: { ...typography.captionMedium, color: colors.textSecondary },
  roleLabelActive: { color: colors.primary },
  infoCard: {
    backgroundColor: colors.info + '10', borderRadius: borderRadius.lg, padding: spacing.lg,
  },
  infoTitle: { ...typography.captionMedium, color: colors.info, marginBottom: spacing.xs },
  infoText: { ...typography.caption, color: colors.text, lineHeight: 20 },
});
