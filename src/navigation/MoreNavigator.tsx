import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MoreMenuScreen } from '../screens/more/MoreMenuScreen';
import { ManageThemesScreen } from '../screens/more/ManageThemesScreen';
import { ThemeCalendarScreen } from '../screens/more/ThemeCalendarScreen';
import { IntegrationsScreen } from '../screens/more/IntegrationsScreen';
import { IntegrationDetailScreen } from '../screens/more/IntegrationDetailScreen';
import { AppLinksScreen } from '../screens/more/AppLinksScreen';
import { AppSettingsScreen } from '../screens/more/AppSettingsScreen';
import { LaunchScreenScreen } from '../screens/more/LaunchScreenScreen';
import { AppInfoScreen } from '../screens/more/AppInfoScreen';
import { ManageUsersScreen } from '../screens/more/ManageUsersScreen';
import { UserFormScreen } from '../screens/more/UserFormScreen';
import { BillingScreen } from '../screens/more/BillingScreen';
import { PublishScreen } from '../screens/more/PublishScreen';
import type { MoreStackParamList } from './types';

const Stack = createStackNavigator<MoreStackParamList>();

export function MoreNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <Stack.Screen name="ManageThemes" component={ManageThemesScreen} />
      <Stack.Screen name="ThemeCalendar" component={ThemeCalendarScreen} />
      <Stack.Screen name="Integrations" component={IntegrationsScreen} />
      <Stack.Screen name="IntegrationDetail" component={IntegrationDetailScreen as any} />
      <Stack.Screen name="AppLinks" component={AppLinksScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
      <Stack.Screen name="LaunchScreen" component={LaunchScreenScreen} />
      <Stack.Screen name="AppInfo" component={AppInfoScreen} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="UserForm" component={UserFormScreen as any} />
      <Stack.Screen name="Billing" component={BillingScreen} />
      <Stack.Screen name="Publish" component={PublishScreen} />
    </Stack.Navigator>
  );
}
