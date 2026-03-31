import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DiscountListScreen } from '../screens/discounts/DiscountListScreen';
import { DiscountFormScreen } from '../screens/discounts/DiscountFormScreen';
import type { DiscountsStackParamList } from './types';

const Stack = createStackNavigator<DiscountsStackParamList>();

export function DiscountsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscountList" component={DiscountListScreen} />
      <Stack.Screen name="DiscountForm" component={DiscountFormScreen as any} />
    </Stack.Navigator>
  );
}
