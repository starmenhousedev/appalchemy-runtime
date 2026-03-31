import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PushListScreen } from '../screens/push/PushListScreen';
import { PushFormScreen } from '../screens/push/PushFormScreen';
import { AutomatedPushScreen } from '../screens/push/AutomatedPushScreen';
import type { PushStackParamList } from './types';

const Stack = createStackNavigator<PushStackParamList>();

export function PushNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PushList" component={PushListScreen} />
      <Stack.Screen name="PushForm" component={PushFormScreen as any} />
      <Stack.Screen name="AutomatedPush" component={AutomatedPushScreen} />
    </Stack.Navigator>
  );
}
