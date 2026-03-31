import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appSettingsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import type { AppInfo } from '../../types';

export function AppInfoScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appId, setAppId] = useState('');
  const [firebaseProjectId, setFirebaseProjectId] = useState('');
  const [androidPackage, setAndroidPackage] = useState('');
  const [iosBundleId, setIosBundleId] = useState('');
  const [iosTeamId, setIosTeamId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await appSettingsApi.getAppInfo();
      setAppId(data.app_id || '');
      setFirebaseProjectId(data.firebase_project_id || '');
      setAndroidPackage(data.android_package_name || '');
      setIosBundleId(data.ios_bundle_id || '');
      setIosTeamId(data.ios_team_id || '');
    } catch {
      // No app info yet
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await appSettingsApi.updateAppInfo({
        app_id: appId.trim(),
        firebase_project_id: firebaseProjectId.trim(),
        android_package_name: androidPackage.trim(),
        ios_bundle_id: iosBundleId.trim(),
        ios_team_id: iosTeamId.trim(),
      });
      showToast('success', 'App info updated');
    } catch {
      showToast('error', 'Failed to update app info');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay fullScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>App Information</Text>
        <Button title="Save" onPress={handleSave} size="sm" loading={saving} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <Input label="App ID" value={appId} onChangeText={setAppId} placeholder="com.yourstore.app" />
          <Input label="Firebase Project ID" value={firebaseProjectId} onChangeText={setFirebaseProjectId} placeholder="your-firebase-project" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ANDROID</Text>
          <Input label="Package Name" value={androidPackage} onChangeText={setAndroidPackage} placeholder="com.yourstore.app" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>iOS</Text>
          <Input label="Bundle ID" value={iosBundleId} onChangeText={setIosBundleId} placeholder="com.yourstore.app" />
          <Input label="Team ID" value={iosTeamId} onChangeText={setIosTeamId} placeholder="ABCDEF1234" />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Need help?</Text>
          <Text style={styles.infoText}>
            These values are used to configure your app builds. You can find your Firebase Project ID in the Firebase Console and your iOS Team ID in the Apple Developer Portal.
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  section: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg, ...shadows.sm,
  },
  sectionTitle: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.info + '10', borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  infoTitle: { ...typography.captionMedium, color: colors.info, marginBottom: spacing.xs },
  infoText: { ...typography.caption, color: colors.text, lineHeight: 20 },
});
