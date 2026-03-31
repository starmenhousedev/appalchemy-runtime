import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { integrationsApi } from '../../api';
import { useStore } from '../../store';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';
import { Button } from '../../components/common/Button';
import { INTEGRATION_PROVIDERS } from '../../utils/constants';
import type { Integration } from '../../types';

const PROVIDER_ICONS: Record<string, string> = {
  razorpay: 'R',
  gokwik: 'G',
  judgeme: 'J',
  shopify: 'S',
  facebook_ads: 'F',
  google_ads: 'G',
  unicommerce: 'U',
  omsguru: 'O',
};

export function IntegrationsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    try {
      const data = await integrationsApi.list();
      setIntegrations(data);
    } catch {
      showToast('error', 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const getProviderLabel = (provider: string) =>
    INTEGRATION_PROVIDERS.find(p => p.value === provider)?.label || provider;

  const renderItem = ({ item }: { item: Integration }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('IntegrationDetail', { provider: item.provider })}>
      <View style={[styles.iconBox, item.is_connected && styles.iconBoxConnected]}>
        <Text style={[styles.iconText, item.is_connected && styles.iconTextConnected]}>
          {PROVIDER_ICONS[item.provider] || item.provider.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.providerName}>{getProviderLabel(item.provider)}</Text>
        <Text style={[styles.statusText, item.is_connected ? styles.connected : styles.disconnected]}>
          {item.is_connected ? 'Connected' : 'Not connected'}
        </Text>
      </View>
      <Text style={styles.chevron}>{'>'}</Text>
    </TouchableOpacity>
  );

  // Show all available providers, merging with connected ones
  const allProviders = INTEGRATION_PROVIDERS.map(p => {
    const existing = integrations.find(i => i.provider === p.value);
    return existing || {
      id: 0,
      shop_id: 0,
      provider: p.value,
      is_connected: false,
      credentials: {},
      settings: {},
      connected_at: null,
      createdAt: '',
      updatedAt: '',
    } as Integration;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" size="sm" />
        <Text style={styles.headerTitle}>Integrations</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={allProviders}
        keyExtractor={item => item.provider}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchIntegrations} colors={[colors.primary]} />
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
    padding: spacing.lg, marginBottom: spacing.sm, ...shadows.sm,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center',
  },
  iconBoxConnected: { backgroundColor: colors.primary + '15' },
  iconText: { ...typography.h4, color: colors.textTertiary },
  iconTextConnected: { color: colors.primary },
  cardInfo: { flex: 1 },
  providerName: { ...typography.bodyMedium, color: colors.text },
  statusText: { ...typography.small, marginTop: 2 },
  connected: { color: colors.success },
  disconnected: { color: colors.textTertiary },
  chevron: { ...typography.body, color: colors.textTertiary },
});
