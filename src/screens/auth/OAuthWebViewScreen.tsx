import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../../components/common/Button';

interface OAuthWebViewScreenProps {
  route: {
    params: {
      shop: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export function OAuthWebViewScreen({ route, navigation }: OAuthWebViewScreenProps) {
  const { shop } = route.params;
  const [opening, setOpening] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const installUrl = authApi.getInstallUrl(shop);

  const openShopify = useCallback(async () => {
    setOpening(true);
    setError(null);

    try {
      await Linking.openURL(installUrl);
    } catch {
      setError('Unable to open Shopify. Please try again.');
    } finally {
      setOpening(false);
    }
  }, [installUrl]);

  useEffect(() => {
    openShopify().catch(() => {
      setError('Unable to open Shopify. Please try again.');
      setOpening(false);
    });
  }, [openShopify]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="ghost"
          size="sm"
        />
        <Text style={styles.headerTitle} numberOfLines={1}>
          Connecting to {shop}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Open Shopify"
            onPress={() => {
              openShopify().catch(() => {
                setError('Unable to open Shopify. Please try again.');
              });
            }}
            variant="outline"
            style={styles.retryButton}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Finish setup in your browser</Text>
          <Text style={styles.body}>
            Shopify will open in your device browser so you can approve the app
            with your store account.
          </Text>
          <Text style={styles.body}>
            {"After approval, you'll come back here automatically."}
          </Text>
          <Button
            title="Open Shopify"
            onPress={() => {
              openShopify().catch(() => {
                setError('Unable to open Shopify. Please try again.');
              });
            }}
            size="lg"
            style={styles.openButton}
          />
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="sm"
          />
        </View>
      )}

      {opening && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Opening Shopify...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 140,
  },
  openButton: {
    minWidth: 200,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
