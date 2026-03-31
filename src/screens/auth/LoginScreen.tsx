import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors, spacing, typography, shadows, borderRadius } from '../../theme';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();

  const handleInstall = () => {
    const domain = shopDomain.trim().toLowerCase();
    if (!domain) {
      setError('Please enter your Shopify store domain');
      return;
    }

    const fullDomain = domain.includes('.myshopify.com')
      ? domain
      : `${domain}.myshopify.com`;

    setError('');
    navigation.navigate('OAuthWebView', { shop: fullDomain });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
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
          <Text style={styles.cardSubtitle}>
            Enter your Shopify store domain to get started
          </Text>

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
            rightIcon={
              <Text style={styles.domainSuffix}>.myshopify.com</Text>
            }
          />

          <Button
            title="Install App"
            onPress={handleInstall}
            size="lg"
          />
        </View>

        <View style={styles.features}>
          {[
            { title: 'Design', desc: 'Build beautiful mobile apps with drag & drop' },
            { title: 'Analytics', desc: 'Track performance with real-time dashboards' },
            { title: 'Publish', desc: 'Submit to Play Store & App Store seamlessly' },
          ].map(feature => (
            <View key={feature.title} style={styles.featureItem}>
              <View style={styles.featureDot} />
              <View style={styles.featureText}>
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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  logoEmoji: {
    fontSize: 32,
    color: colors.textInverse,
    fontWeight: '700',
  },
  appName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    ...shadows.md,
    marginBottom: 32,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  domainSuffix: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  features: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  featureDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
