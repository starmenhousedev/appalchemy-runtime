import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pushApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function nowPlusMinutes(mins: number) {
  const d = new Date(Date.now() + mins * 60_000);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function isValidDate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function isValidTime(s: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const initialDt = nowPlusMinutes(15);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(initialDt.date);
  const [scheduleTime, setScheduleTime] = useState(initialDt.time);

  useEffect(() => {
    if (notificationId) {
      loadNotification();
    }
  }, [notificationId]);

  const loadNotification = async () => {
    try {
      const data = await pushApi.get(notificationId!);
      setTitle(data?.title ?? '');
      setMessage(data?.message ?? '');
      setImageUrl(data?.image_url ?? '');
      setLinkUrl(data?.link_url ?? '');
      if (data?.scheduled_at) {
        const d = new Date(data.scheduled_at);
        if (!Number.isNaN(d.getTime())) {
          setScheduleEnabled(true);
          setScheduleDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
          setScheduleTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
        }
      }
    } catch {
      showToast('error', 'Failed to load notification');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const buildScheduledAt = (): string | null | undefined => {
    if (!scheduleEnabled) return null;
    if (!isValidDate(scheduleDate) || !isValidTime(scheduleTime)) {
      throw new Error('Invalid date or time');
    }
    const iso = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    return iso;
  };

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      showToast('error', 'Title and message are required');
      return;
    }

    let scheduledAt: string | null;
    try {
      scheduledAt = buildScheduledAt() ?? null;
    } catch {
      showToast('error', 'Schedule date/time is invalid');
      return;
    }

    if (scheduleEnabled && scheduledAt) {
      const t = new Date(scheduledAt).getTime();
      if (Number.isNaN(t) || t <= Date.now()) {
        showToast('error', 'Schedule must be in the future');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        image_url: imageUrl.trim() || undefined,
        link_url: linkUrl.trim() || undefined,
        scheduled_at: scheduledAt,
      };
      if (isEditing) {
        await pushApi.update(notificationId!, payload);
        showToast('success', 'Notification updated');
      } else {
        await pushApi.create(payload);
        showToast('success', scheduledAt ? 'Notification scheduled' : 'Notification created');
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

  const handleUploadImage = async () => {
    const url = imageUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      showToast('error', 'Paste a public http(s) URL first');
      return;
    }
    setUploadingImage(true);
    try {
      const filename = url.split('/').pop()?.split('?')[0] || `push-${Date.now()}.jpg`;
      const formData = new FormData();
      formData.append('file', {
        uri: url,
        name: filename,
        type: 'image/jpeg',
      } as unknown as Blob);
      const result = await pushApi.uploadImage(formData);
      if (result?.url) {
        setImageUrl(result.url);
        showToast('success', 'Image hosted');
      } else {
        showToast('error', 'Upload returned no URL');
      }
    } catch {
      showToast('error', 'Failed to host image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleReschedule = async () => {
    if (!notificationId) return;
    if (!isValidDate(scheduleDate) || !isValidTime(scheduleTime)) {
      showToast('error', 'Use YYYY-MM-DD and HH:MM');
      return;
    }
    const iso = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    if (new Date(iso).getTime() <= Date.now()) {
      showToast('error', 'Schedule must be in the future');
      return;
    }
    setRescheduling(true);
    try {
      await pushApi.schedule(notificationId, iso);
      showToast('success', 'Notification rescheduled');
      navigation.goBack();
    } catch {
      showToast('error', 'Failed to reschedule');
    } finally {
      setRescheduling(false);
    }
  };

  const setQuickSchedule = (mins: number) => {
    const v = nowPlusMinutes(mins);
    setScheduleEnabled(true);
    setScheduleDate(v.date);
    setScheduleTime(v.time);
  };

  if (loading) return <LoadingOverlay fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>{isEditing ? 'Edit' : 'New'} Notification</Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.previewContainer}>
          <View style={styles.notificationPreview}>
            <View style={styles.notifHeader}>
              <View style={styles.notifAppIcon} />
              <Text style={styles.notifAppName}>Your App</Text>
              <Text style={styles.notifTime}>now</Text>
            </View>
            <Text style={styles.notifTitle} numberOfLines={1}>
              {title || 'Notification Title'}
            </Text>
            <Text style={styles.notifMessage} numberOfLines={2}>
              {message || 'Notification message preview'}
            </Text>
          </View>
        </View>

        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Notification title" />
        <Input label="Message" value={message} onChangeText={setMessage} placeholder="Notification message" multiline numberOfLines={3} />
        <Input label="Image URL (optional)" value={imageUrl} onChangeText={setImageUrl} placeholder="https://example.com/image.jpg" keyboardType="url" autoCapitalize="none" />
        <Button
          title={uploadingImage ? 'Hosting…' : 'Host this image on our CDN'}
          onPress={handleUploadImage}
          variant="outline"
          size="sm"
          loading={uploadingImage}
          style={{ marginTop: -spacing.sm, marginBottom: spacing.lg, alignSelf: 'flex-start' }}
        />
        <Input label="Link URL (optional)" value={linkUrl} onChangeText={setLinkUrl} placeholder="Deep link or URL" keyboardType="url" autoCapitalize="none" />

        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleTitle}>Schedule</Text>
              <Text style={styles.scheduleSubtitle}>
                {scheduleEnabled ? 'Send later at the time below' : 'Send manually after saving'}
              </Text>
            </View>
            <Switch
              value={scheduleEnabled}
              onValueChange={setScheduleEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={scheduleEnabled ? colors.primary : colors.textTertiary}
            />
          </View>

          {scheduleEnabled && (
            <>
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Input
                    label="Date (YYYY-MM-DD)"
                    value={scheduleDate}
                    onChangeText={setScheduleDate}
                    placeholder="2026-12-31"
                    keyboardType="numbers-and-punctuation"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.dateField}>
                  <Input
                    label="Time (HH:MM)"
                    value={scheduleTime}
                    onChangeText={setScheduleTime}
                    placeholder="14:30"
                    keyboardType="numbers-and-punctuation"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={styles.quickRow}>
                <TouchableOpacity style={styles.quickChip} onPress={() => setQuickSchedule(60)}>
                  <Text style={styles.quickChipText}>+1h</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickChip} onPress={() => setQuickSchedule(60 * 24)}>
                  <Text style={styles.quickChipText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickChip} onPress={() => setQuickSchedule(60 * 24 * 7)}>
                  <Text style={styles.quickChipText}>Next week</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {isEditing && scheduleEnabled && (
          <Button
            title={rescheduling ? 'Rescheduling…' : 'Reschedule only'}
            onPress={handleReschedule}
            variant="outline"
            size="md"
            loading={rescheduling}
            style={{ marginTop: spacing.lg }}
          />
        )}
        {isEditing && (
          <Button title="Send Now" onPress={handleSend} variant="secondary" size="lg" style={styles.sendButton} />
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
  previewContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  notificationPreview: {
    width: '100%', backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, padding: spacing.md,
    ...shadows.md, borderWidth: 1, borderColor: colors.borderLight,
  },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  notifAppIcon: { width: 16, height: 16, borderRadius: 4, backgroundColor: colors.primary, marginRight: spacing.xs },
  notifAppName: { ...typography.small, color: colors.textTertiary, flex: 1 },
  notifTime: { ...typography.small, color: colors.textTertiary },
  notifTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: 2 },
  notifMessage: { ...typography.caption, color: colors.textSecondary },
  scheduleCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginTop: spacing.md, ...shadows.sm,
  },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  scheduleTitle: { ...typography.bodyMedium, color: colors.text },
  scheduleSubtitle: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  dateRow: { flexDirection: 'row', gap: spacing.md },
  dateField: { flex: 1 },
  quickRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  quickChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary,
  },
  quickChipText: { ...typography.small, color: colors.textSecondary },
  sendButton: { marginTop: spacing.lg },
});
