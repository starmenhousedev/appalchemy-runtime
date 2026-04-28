import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastContainer } from './src/components/common/Toast';
import { ThemeProvider } from './src/theme';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
        <ToastContainer />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
