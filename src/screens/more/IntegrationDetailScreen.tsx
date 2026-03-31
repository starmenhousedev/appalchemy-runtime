import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { integrationsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
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
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const providerLabel = INTEGRATION_PROVIDERS.find(p => p.value === provider)?.label || provider;

  useEffect(() => {
    loadIntegration();
  }, []);

  const loadIntegration = async () => {
    try {
      const data = await integrationsApi.get(provider);
      setIntegration(data);
      if (data.credentials) {
        setApiKey((data.credentials as Record<string, string>).api_key || '');
        setApiSecret((data.credentials as Record<string, string>).api_secret || '');
      }
    } catch {
      // Not connected yet — that's fine
    } finally {
      setLoading(false);
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
    Alert.alert(
      'Disconnect',
      `Disconnect ${providerLabel}? This will remove saved credentials.`,
      [
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
      ],
    );
  };

  if (loading) return <LoadingOverlay fullScreen />;

  const isConnected = integration?.is_connected;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>{providerLabel}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, isConnected ? styles.statusConnected : styles.statusDisconnected]}>
            <Text style={styles.statusIconText}>{isConnected ? 'OK' : '--'}</Text>
          </View>
          <Text style={styles.statusLabel}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </Text>
          {isConnected && integration?.connected_at && (
            <Text style={styles.connectedSince}>
              Since {new Date(integration.connected_at).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Credentials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credentials</Text>
          <Input
            label="API Key"
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter API Key"
            editable={!isConnected}
          />
          <Input
            label="API Secret (optional)"
            value={apiSecret}
            onChangeText={setApiSecret}
            placeholder="Enter API Secret"
            secureTextEntry
            editable={!isConnected}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {isConnected ? (
            <Button title="Disconnect" onPress={handleDisconnect} variant="danger" />
          ) : (
            <Button title="Connect" onPress={handleConnect} loading={saving} />
          )}
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
  statusCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, ...shadows.sm,
  },
  statusIcon: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  statusConnected: { backgroundColor: colors.successLight },
  statusDisconnected: { backgroundColor: colors.surfaceSecondary },
  statusIconText: { ...typography.h4, color: colors.success },
  statusLabel: { ...typography.h4, color: colors.text },
  connectedSince: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs },
  section: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg, ...shadows.sm,
  },
  sectionTitle: {
    ...typography.captionMedium, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md,
  },
  actions: { marginTop: spacing.md },
});
