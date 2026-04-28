import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appSettingsApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { SectionCard } from '../../components/common/SectionCard';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';

export function AppInfoScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
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
    (async () => {
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
    })();
  }, []);

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.md },
        infoCard: {
          backgroundColor: theme.colors.infoLight,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.info + '40',
        },
        infoTitle: { ...theme.typography.bodyMedium, color: theme.colors.info, marginBottom: theme.spacing.xs },
        infoText: { ...theme.typography.caption, color: theme.colors.text, lineHeight: 20 },
      }),
    [theme, insets.bottom],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="App Information"
        onBack={() => navigation.goBack()}
        right={<ActionButton label="Save" size="sm" loading={saving} onPress={handleSave} />}
      />
      {loading ? (
        <LoadingState message="Loading…" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <SectionCard title="General">
            <Input label="App ID" value={appId} onChangeText={setAppId} placeholder="com.yourstore.app" autoCapitalize="none" />
            <Input
              label="Firebase Project ID"
              value={firebaseProjectId}
              onChangeText={setFirebaseProjectId}
              placeholder="your-firebase-project"
              autoCapitalize="none"
            />
          </SectionCard>
          <SectionCard title="Android">
            <Input
              label="Package Name"
              value={androidPackage}
              onChangeText={setAndroidPackage}
              placeholder="com.yourstore.app"
              autoCapitalize="none"
            />
          </SectionCard>
          <SectionCard title="iOS">
            <Input
              label="Bundle ID"
              value={iosBundleId}
              onChangeText={setIosBundleId}
              placeholder="com.yourstore.app"
              autoCapitalize="none"
            />
            <Input label="Team ID" value={iosTeamId} onChangeText={setIosTeamId} placeholder="ABCDEF1234" autoCapitalize="characters" />
          </SectionCard>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Need help?</Text>
            <Text style={styles.infoText}>
              These values configure your app builds. You can find your Firebase Project ID in the Firebase Console and your iOS Team ID in the Apple Developer Portal.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
