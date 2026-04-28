import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardHomeScreen } from '../screens/dashboard/DashboardHomeScreen';
import type { DashboardStackParamList } from './types';

const Stack = createStackNavigator<DashboardStackParamList>();

export function DashboardNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardHomeScreen} />
    </Stack.Navigator>
  );
}
