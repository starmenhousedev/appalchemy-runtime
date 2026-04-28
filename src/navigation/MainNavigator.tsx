import React, { useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { DashboardNavigator } from './DashboardNavigator';
import { DesignNavigator } from './DesignNavigator';
import { AnalyticsNavigator } from './AnalyticsNavigator';
import { DiscountsNavigator } from './DiscountsNavigator';
import { PushNavigator } from './PushNavigator';
import { MoreNavigator } from './MoreNavigator';
import { useTheme } from '../theme';
import {
  DrawerHeader,
  DrawerSection,
  DrawerItem,
  DrawerFooter,
  DrawerBadge,
} from '../components/drawer';
import type { DrawerParamList, MoreStackParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

interface MainEntry {
  key: keyof DrawerParamList;
  label: string;
  icon: string;
  badge?: DrawerBadge;
}

interface ManagementEntry {
  key: string;
  label: string;
  icon: string;
  moreScreen: keyof MoreStackParamList;
  badge?: DrawerBadge;
}

const MAIN_ITEMS: MainEntry[] = [
  { key: 'Dashboard', label: 'Dashboard', icon: '⌂' },
  { key: 'Design', label: 'Design', icon: '◫' },
  { key: 'Analytics', label: 'Analytics', icon: '◔' },
  { key: 'Discounts', label: 'Discounts', icon: '%' },
  { key: 'Push', label: 'Push Notifications', icon: '⌘' },
];

const MANAGEMENT_ITEMS: ManagementEntry[] = [
  { key: 'manage-themes', label: 'Manage Themes', icon: '◫', moreScreen: 'ManageThemes' },
  { key: 'integrations', label: 'Integrations', icon: '⚯', moreScreen: 'Integrations' },
  { key: 'users', label: 'Users', icon: '◉', moreScreen: 'ManageUsers' },
  { key: 'billing', label: 'Billing', icon: '$', moreScreen: 'Billing' },
  { key: 'settings', label: 'Settings', icon: '⚙', moreScreen: 'MoreMenu' },
];

interface NestedNavState {
  index: number;
  routes: { name: string }[];
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const shop = useStore(s => s.shop);
  const logout = useStore(s => s.logout);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const drawerState = props.state;
  const activeDrawerName = drawerState.routeNames[drawerState.index] as keyof DrawerParamList;
  const activeRoute = drawerState.routes[drawerState.index];
  const nestedState = activeRoute.state as NestedNavState | undefined;
  const activeNestedScreen = nestedState?.routes?.[nestedState.index]?.name;

  const navigateMain = (key: keyof DrawerParamList) => {
    props.navigation.navigate(key);
  };

  const navigateManagement = (entry: ManagementEntry) => {
    // Cross-stack: open More drawer route, navigate to the inner screen.
    props.navigation.navigate('More', { screen: entry.moreScreen } as never);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const status = useMemo(
    () => (shop ? { label: 'Connected', tone: 'success' as const } : { label: 'Not connected', tone: 'neutral' as const }),
    [shop],
  );

  return (
    <View style={[styles.drawer, { backgroundColor: theme.colors.drawerBg }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <DrawerHeader
          appName="AppAlchemy"
          shopName={shop?.shop_name || shop?.shop_domain || 'My Store'}
          paddingTop={insets.top}
          status={status}
        />

        <DrawerSection title="Main" showDivider>
          {MAIN_ITEMS.map(item => {
            const active = item.key === activeDrawerName;
            return (
              <DrawerItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                active={active}
                badge={item.badge}
                onPress={() => navigateMain(item.key)}
              />
            );
          })}
        </DrawerSection>

        <DrawerSection title="Management" showDivider>
          {MANAGEMENT_ITEMS.map(item => {
            const active = activeDrawerName === 'More' && activeNestedScreen === item.moreScreen;
            return (
              <DrawerItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                active={active}
                badge={item.badge}
                onPress={() => navigateManagement(item)}
              />
            );
          })}
        </DrawerSection>
      </DrawerContentScrollView>

      <DrawerFooter
        version="1.0.0"
        onLogout={handleLogout}
        paddingBottom={insets.bottom}
      />
    </View>
  );
}

export function MainNavigator() {
  const theme = useTheme();
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: 300, backgroundColor: theme.colors.drawerBg },
        overlayColor: theme.colors.overlay,
        swipeEdgeWidth: 32,
      }}>
      <Drawer.Screen name="Dashboard" component={DashboardNavigator} />
      <Drawer.Screen name="Design" component={DesignNavigator} />
      <Drawer.Screen name="Analytics" component={AnalyticsNavigator} />
      <Drawer.Screen name="Discounts" component={DiscountsNavigator} />
      <Drawer.Screen name="Push" component={PushNavigator} />
      <Drawer.Screen name="More" component={MoreNavigator} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 8 },
});
