import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { integrationsApi } from '../../api';
import { useStore } from '../../store';
import { useTheme } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { ListItemCard } from '../../components/common/ListItemCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
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
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useStore(s => s.showToast);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    try {
      const data = await integrationsApi.list();
      setIntegrations(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const allProviders = useMemo(
    () =>
      INTEGRATION_PROVIDERS.map(p => {
        const existing = integrations.find(i => i.provider === p.value);
        return (
          existing ||
          ({
            id: 0,
            shop_id: 0,
            provider: p.value,
            is_connected: false,
            credentials: {},
            settings: {},
            connected_at: null,
            createdAt: '',
            updatedAt: '',
          } as Integration)
        );
      }),
    [integrations],
  );

  const connectedCount = integrations.filter(i => i.is_connected).length;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        list: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl + insets.bottom, gap: theme.spacing.sm },
      }),
    [theme, insets.bottom],
  );

  const getLabel = (provider: string) =>
    INTEGRATION_PROVIDERS.find(p => p.value === provider)?.label || provider;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        title="Integrations"
        subtitle={`${connectedCount} connected · ${allProviders.length} available`}
        onBack={() => navigation.goBack()}
      />
      {loading ? (
        <LoadingState message="Loading integrations…" />
      ) : (
        <FlatList
          data={allProviders}
          keyExtractor={item => item.provider}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchIntegrations} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
          }
          renderItem={({ item }) => (
            <ListItemCard
              title={getLabel(item.provider)}
              subtitle={item.is_connected ? 'Connected · ready to use' : 'Tap to connect this service'}
              iconLabel={PROVIDER_ICONS[item.provider] || item.provider.charAt(0).toUpperCase()}
              iconColor={item.is_connected ? theme.colors.success : theme.colors.textSecondary}
              badge={
                <StatusBadge
                  label={item.is_connected ? 'Connected' : 'Not connected'}
                  tone={item.is_connected ? 'success' : 'neutral'}
                  dot={item.is_connected}
                />
              }
              onPress={() => navigation.navigate('IntegrationDetail', { provider: item.provider })}
            />
          )}
        />
      )}
    </View>
  );
}
