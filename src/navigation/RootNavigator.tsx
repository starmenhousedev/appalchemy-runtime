import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { parseAuthCallbackUrl } from '../utils/authCallback';

export function RootNavigator() {
  const { isAuthenticated, isLoading, hydrateFromStorage, login } = useStore();
  const handledUrlRef = useRef<string | null>(null);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    const handleIncomingUrl = async (url: string | null) => {
      if (!url || handledUrlRef.current === url) {
        return;
      }

      const authParams = parseAuthCallbackUrl(url);
      if (!authParams) {
        return;
      }

      handledUrlRef.current = url;

      try {
        await login(authParams.token, authParams.shop);
      } catch {
        handledUrlRef.current = null;
      }
    };

    Linking.getInitialURL()
      .then(handleIncomingUrl)
      .catch(() => {});

    const subscription = Linking.addEventListener('url', event => {
      handleIncomingUrl(event.url).catch(() => {});
    });

    return () => {
      subscription.remove();
    };
  }, [login]);

  return (
    <>
      {isLoading ? (
        <LoadingOverlay fullScreen message="Starting AppAlchemy..." />
      ) : (
        <NavigationContainer>
          {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      )}
    </>
  );
}
