import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pushApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

export function PushFormScreen({
  route,
  navigation,
}: {
  route: { params?: { notificationId?: number } };
  navigation: any;
}) {
  const notificationId = route.params?.notificationId;
  const isEditing = !!notificationId;
  const showToast = useStore(s => s.showToast);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (notificationId) {
      loadNotification();
    }
  }, [notificationId]);

  const loadNotification = async () => {
    try {
      const data = await pushApi.get(notificationId!);
      setTitle(data.title);
      setMessage(data.message);
      setImageUrl(data.image_url || '');
      setLinkUrl(data.link_url || '');
    } catch {
      showToast('error', 'Failed to load notification');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      showToast('error', 'Title and message are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        image_url: imageUrl.trim() || undefined,
        link_url: linkUrl.trim() || undefined,
      };
      if (isEditing) {
        await pushApi.update(notificationId!, payload);
        showToast('success', 'Notification updated');
      } else {
        await pushApi.create(payload);
        showToast('success', 'Notification created');
      }
      navigation.goBack();
    } catch {
      showToast('error', `Failed to ${isEditing ? 'update' : 'create'} notification`);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!notificationId) return;
    try {
      await pushApi.send(notificationId);
      showToast('success', 'Notification sent!');
      navigation.goBack();
    } catch {
      showToast('error', 'Failed to send notification');
    }
  };

  if (loading) return <LoadingOverlay fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>{isEditing ? 'Edit' : 'New'} Notification</Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Phone preview */}
        <View style={styles.previewContainer}>
          <View style={styles.notificationPreview}>
            <View style={styles.notifHeader}>
              <View style={styles.notifAppIcon} />
              <Text style={styles.notifAppName}>Your App</Text>
              <Text style={styles.notifTime}>now</Text>
            </View>
            <Text style={styles.notifTitle} numberOfLines={1}>{title || 'Notification Title'}</Text>
            <Text style={styles.notifMessage} numberOfLines={2}>{message || 'Notification message preview'}</Text>
          </View>
        </View>

        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Notification title" />
        <Input label="Message" value={message} onChangeText={setMessage} placeholder="Notification message" multiline numberOfLines={3} />
        <Input label="Image URL (optional)" value={imageUrl} onChangeText={setImageUrl} placeholder="https://example.com/image.jpg" keyboardType="url" />
        <Input label="Link URL (optional)" value={linkUrl} onChangeText={setLinkUrl} placeholder="Deep link or URL" keyboardType="url" />

        {isEditing && (
          <Button
            title="Send Now"
            onPress={handleSend}
            variant="secondary"
            size="lg"
            style={styles.sendButton}
          />
        )}
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  previewContainer: {
    alignItems: 'center', marginBottom: spacing.xxl,
  },
  notificationPreview: {
    width: '100%', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md,
    ...shadows.md, borderWidth: 1, borderColor: colors.borderLight,
  },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  notifAppIcon: {
    width: 16, height: 16, borderRadius: 4, backgroundColor: colors.primary, marginRight: spacing.xs,
  },
  notifAppName: { ...typography.small, color: colors.textTertiary, flex: 1 },
  notifTime: { ...typography.small, color: colors.textTertiary },
  notifTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: 2 },
  notifMessage: { ...typography.caption, color: colors.textSecondary },
  sendButton: { marginTop: spacing.lg },
});
