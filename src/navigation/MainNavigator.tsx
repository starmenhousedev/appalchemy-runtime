import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { DesignNavigator } from './DesignNavigator';
import { AnalyticsNavigator } from './AnalyticsNavigator';
import { DiscountsNavigator } from './DiscountsNavigator';
import { PushNavigator } from './PushNavigator';
import { MoreNavigator } from './MoreNavigator';
import { colors, spacing, typography, borderRadius } from '../theme';
import type { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const shop = useStore(s => s.shop);
  const logout = useStore(s => s.logout);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        <View style={[styles.drawerHeader, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <View style={styles.logoInfo}>
              <Text style={styles.appTitle}>AppAlchemy</Text>
              <Text style={styles.shopName} numberOfLines={1}>
                {shop?.shop_name || shop?.shop_domain || 'My Store'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.drawerItems}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function MainNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: styles.drawer,
        drawerActiveTintColor: colors.textInverse,
        drawerInactiveTintColor: colors.drawerText,
        drawerActiveBackgroundColor: colors.drawerActiveBg,
        drawerLabelStyle: styles.drawerLabel,
        drawerItemStyle: styles.drawerItem,
      }}>
      <Drawer.Screen
        name="Design"
        component={DesignNavigator}
        options={{ drawerLabel: 'Design' }}
      />
      <Drawer.Screen
        name="Analytics"
        component={AnalyticsNavigator}
        options={{ drawerLabel: 'Analytics' }}
      />
      <Drawer.Screen
        name="Discounts"
        component={DiscountsNavigator}
        options={{ drawerLabel: 'Discounts' }}
      />
      <Drawer.Screen
        name="Push"
        component={PushNavigator}
        options={{ drawerLabel: 'Push Notifications' }}
      />
      <Drawer.Screen
        name="More"
        component={MoreNavigator}
        options={{ drawerLabel: 'More' }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.drawerBg,
  },
  drawerScroll: {
    flex: 1,
  },
  drawer: {
    width: 280,
    backgroundColor: colors.drawerBg,
  },
  drawerHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textInverse,
  },
  logoInfo: {
    flex: 1,
  },
  appTitle: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
  shopName: {
    ...typography.caption,
    color: colors.drawerText,
    opacity: 0.7,
  },
  drawerItems: {
    paddingHorizontal: spacing.sm,
  },
  drawerLabel: {
    ...typography.bodyMedium,
    marginLeft: -spacing.lg,
  },
  drawerItem: {
    borderRadius: borderRadius.md,
    marginVertical: 2,
    paddingVertical: 2,
  },
  drawerFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  logoutButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  logoutText: {
    ...typography.bodyMedium,
    color: colors.error,
  },
});
