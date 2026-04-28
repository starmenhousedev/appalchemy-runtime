import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { integrationsApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ActionButton } from '../../components/common/ActionButton';
import { SectionCard } from '../../components/common/SectionCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { Input } from '../../components/common/Input';
import { INTEGRATION_PROVIDERS } from '../../utils/constants';
import type { Integration } from '../../types';
import type { IntegrationProvider } from '../../types/integration';

export function IntegrationDetailScreen({
  route,
  navigation,
}: {
  route: { params: { provider: IntegrationProvider } };
  navigation: any;
}) {
  const { provider } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);

  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [settingsJson, setSettingsJson] = useState('{}');

  const providerLabel = INTEGRATION_PROVIDERS.find(p => p.value === provider)?.label || provider;

  useEffect(() => {
    (async () => {
      try {
        const data = await integrationsApi.get(provider);
        setIntegration(data);
        if (data.credentials) {
          setApiKey((data.credentials as Record<string, string>).api_key || '');
          setApiSecret((data.credentials as Record<string, string>).api_secret || '');
        }
        setSettingsJson(JSON.stringify(data.settings ?? {}, null, 2));
      } catch {
        // Not connected yet
      } finally {
        setLoading(false);
      }
    })();
  }, [provider]);

  const handleSaveSettings = async () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(settingsJson || '{}');
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Settings must be a JSON object');
      }
    } catch (err: any) {
      showToast('error', err?.message ?? 'Invalid JSON');
      return;
    }
    setSavingSettings(true);
    try {
      const updated = await integrationsApi.update(provider, parsed);
      setIntegration(updated);
      setSettingsJson(JSON.stringify(updated.settings ?? {}, null, 2));
      showToast('success', `${providerLabel} settings saved`);
    } catch {
      showToast('error', 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      showToast('error', 'API Key is required');
      return;
    }
    setSaving(true);
    try {
      const data = await integrationsApi.connect(provider, {
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
      setIntegration(data);
      showToast('success', `${providerLabel} connected`);
    } catch {
      showToast('error', `Failed to connect ${providerLabel}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnect', `Disconnect ${providerLabel}? This will remove saved credentials.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          try {
            await integrationsApi.disconnect(provider);
            setIntegration(null);
            setApiKey('');
            setApiSecret('');
            showToast('success', `${providerLabel} disconnected`);
          } catch {
            showToast('error', `Failed to disconnect ${providerLabel}`);
          }
        },
      },
    ]);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.md },
        statusCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xl,
          alignItems: 'center',
          ...theme.shadows.sm,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        statusIcon: {
          width: 64,
          height: 64,
          borderRadius: 32,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        statusIconText: { ...theme.typography.h3, fontWeight: '700' },
        statusLabel: { ...theme.typography.h4, color: theme.colors.text },
        connectedSince: { ...theme.typography.caption, color: theme.colors.textTertiary, marginTop: theme.spacing.xs },
      }),
    [theme, insets.bottom],
  );

  const isConnected = integration?.is_connected;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title={providerLabel} onBack={() => navigation.goBack()} />
      {loading ? (
        <LoadingState message="Loading…" />
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: isConnected ? theme.colors.successLight : theme.colors.surfaceSecondary,
                },
              ]}>
              <Text
                style={[
                  styles.statusIconText,
                  { color: isConnected ? theme.colors.success : theme.colors.textTertiary },
                ]}>
                {isConnected ? '✓' : '○'}
              </Text>
            </View>
            <Text style={styles.statusLabel}>{isConnected ? 'Connected' : 'Not Connected'}</Text>
            {isConnected && integration?.connected_at ? (
              <Text style={styles.connectedSince}>
                Since {new Date(integration.connected_at).toLocaleDateString()}
              </Text>
            ) : null}
            <View style={{ marginTop: theme.spacing.sm }}>
              <StatusBadge
                label={isConnected ? 'Active' : 'Inactive'}
                tone={isConnected ? 'success' : 'neutral'}
                dot
              />
            </View>
          </View>

          <SectionCard title="Credentials">
            <Input
              label="API Key"
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter API Key"
              editable={!isConnected}
              autoCapitalize="none"
            />
            <Input
              label="API Secret (optional)"
              value={apiSecret}
              onChangeText={setApiSecret}
              placeholder="Enter API Secret"
              secureTextEntry
              editable={!isConnected}
              autoCapitalize="none"
            />
          </SectionCard>

          {isConnected ? (
            <SectionCard title="Settings" subtitle="Provider-specific configuration as JSON">
              <Input
                label="Settings (JSON)"
                value={settingsJson}
                onChangeText={setSettingsJson}
                multiline
                numberOfLines={6}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <ActionButton
                label="Save settings"
                onPress={handleSaveSettings}
                loading={savingSettings}
                fullWidth
              />
            </SectionCard>
          ) : null}

          {isConnected ? (
            <ActionButton label="Disconnect" variant="danger" onPress={handleDisconnect} fullWidth size="lg" />
          ) : (
            <ActionButton label="Connect" onPress={handleConnect} loading={saving} fullWidth size="lg" />
          )}
        </ScrollView>
      )}
    </View>
  );
}
