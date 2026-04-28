import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input } from '../../components/common/Input';
import { ActionButton } from '../../components/common/ActionButton';
import { useTheme } from '../../theme';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');

  const handleInstall = () => {
    const domain = shopDomain.trim().toLowerCase();
    if (!domain) {
      setError('Please enter your Shopify store domain');
      return;
    }
    const fullDomain = domain.includes('.myshopify.com') ? domain : `${domain}.myshopify.com`;
    setError('');
    navigation.navigate('OAuthWebView', { shop: fullDomain });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: theme.colors.background },
        scroll: { flexGrow: 1, paddingHorizontal: theme.spacing.xl },
        logoContainer: { alignItems: 'center', marginBottom: 36 },
        logoIcon: {
          width: 80,
          height: 80,
          borderRadius: theme.borderRadius.xl,
          backgroundColor: theme.colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
          ...theme.shadows.lg,
        },
        logoEmoji: { fontSize: 36, color: '#fff', fontWeight: '700' },
        appName: { ...theme.typography.h1, color: theme.colors.text, marginBottom: theme.spacing.xs },
        tagline: { ...theme.typography.body, color: theme.colors.textSecondary },
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xxl,
          ...theme.shadows.md,
          marginBottom: theme.spacing.xxxl,
          borderColor: theme.colors.borderLight,
          borderWidth: StyleSheet.hairlineWidth,
        },
        cardTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.xs },
        cardSubtitle: {
          ...theme.typography.body,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.xl,
        },
        domainSuffix: { ...theme.typography.caption, color: theme.colors.textTertiary },
        features: { gap: theme.spacing.lg, marginBottom: theme.spacing.xxxl },
        featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.md },
        featureDot: {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.colors.primary,
          marginTop: 6,
        },
        featureTitle: { ...theme.typography.bodyMedium, color: theme.colors.text },
        featureDesc: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: 2 },
      }),
    [theme],
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>A</Text>
          </View>
          <Text style={styles.appName}>AppAlchemy</Text>
          <Text style={styles.tagline}>Mobile App Builder for Shopify</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connect your store</Text>
          <Text style={styles.cardSubtitle}>Enter your Shopify store domain to get started</Text>

          <Input
            label="Store Domain"
            placeholder="your-store"
            value={shopDomain}
            onChangeText={text => {
              setShopDomain(text);
              setError('');
            }}
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleInstall}
            rightIcon={<Text style={styles.domainSuffix}>.myshopify.com</Text>}
          />

          <ActionButton label="Install App" onPress={handleInstall} size="lg" fullWidth />
        </View>

        <View style={styles.features}>
          {[
            { title: 'Design', desc: 'Build beautiful mobile apps with drag & drop' },
            { title: 'Analytics', desc: 'Track performance with real-time dashboards' },
            { title: 'Publish', desc: 'Submit to Play Store & App Store seamlessly' },
          ].map(feature => (
            <View key={feature.title} style={styles.featureItem}>
              <View style={styles.featureDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
