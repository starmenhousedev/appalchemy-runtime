import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../api';
import { useStore } from '../../store';
import { parseAuthCallbackUrl } from '../../utils/authCallback';
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
  const { login } = useStore();
  const insets = useSafeAreaInsets();
  const installUrl = authApi.getInstallUrl(shop);
  const handledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const completeAuth = useCallback(
    async (url: string) => {
      if (handledRef.current) {
        return;
      }
      const params = parseAuthCallbackUrl(url);
      if (!params) {
        return;
      }
      handledRef.current = true;
      try {
        await login(params.token, params.shop);
      } catch {
        handledRef.current = false;
        setError('Sign-in failed. Please try again.');
      }
    },
    [login],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      if (parseAuthCallbackUrl(request.url)) {
        completeAuth(request.url).catch(() => {});
        return false;
      }
      return true;
    },
    [completeAuth],
  );

  const onNavigationStateChange = useCallback(
    (state: WebViewNavigation) => {
      if (parseAuthCallbackUrl(state.url)) {
        completeAuth(state.url).catch(() => {});
      }
    },
    [completeAuth],
  );

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
            title="Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.retryButton}
          />
        </View>
      ) : (
        <WebView
          source={{ uri: installUrl }}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onNavigationStateChange={onNavigationStateChange}
          startInLoadingState
          incognito
          cacheEnabled={false}
          thirdPartyCookiesEnabled
          javaScriptEnabled
          domStorageEnabled
          userAgent="Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
          applicationNameForUserAgent="AppEngineX"
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Opening Shopify...</Text>
            </View>
          )}
        />
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
});
