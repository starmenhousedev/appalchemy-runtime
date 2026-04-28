import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeEditorScreen } from '../screens/design/ThemeEditorScreen';
import { PageEditorScreen } from '../screens/design/PageEditorScreen';
import { SectionEditorScreen } from '../screens/design/SectionEditorScreen';
import { BottomBarEditorScreen } from '../screens/design/BottomBarEditorScreen';
import { ThemeSettingsScreen } from '../screens/design/ThemeSettingsScreen';
import { ThemeCodeScreen } from '../screens/design/ThemeCodeScreen';
import { PreviewScreen } from '../screens/design/PreviewScreen';
import type { DesignStackParamList } from './types';

const Stack = createStackNavigator<DesignStackParamList>();

export function DesignNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ThemeEditor" component={ThemeEditorScreen} />
      <Stack.Screen name="PageEditor" component={PageEditorScreen as any} />
      <Stack.Screen name="SectionEditor" component={SectionEditorScreen as any} />
      <Stack.Screen name="BottomBarEditor" component={BottomBarEditorScreen as any} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen as any} />
      <Stack.Screen name="ThemeCode" component={ThemeCodeScreen as any} />
      <Stack.Screen name="Preview" component={PreviewScreen as any} />
    </Stack.Navigator>
  );
}
