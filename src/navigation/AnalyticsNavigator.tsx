import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '../screens/analytics/DashboardScreen';
import { ConversionFunnelScreen } from '../screens/analytics/ConversionFunnelScreen';
import { TopProductsScreen } from '../screens/analytics/TopProductsScreen';
import type { AnalyticsStackParamList } from './types';

const Stack = createStackNavigator<AnalyticsStackParamList>();

export function AnalyticsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ConversionFunnel" component={ConversionFunnelScreen} />
      <Stack.Screen name="TopProducts" component={TopProductsScreen} />
    </Stack.Navigator>
  );
}
