import 'react-native-gesture-handler';
import React from 'react';
import { RuntimeApp } from './src/runtime/RuntimeApp';

// AppEngineX is now repurposed as the AppAlchemy *runtime* — the universal
// React Native binary that consumes a merchant's published theme JSON.
//
// The original builder-style screens under src/screens/, src/navigation/,
// etc. are unused by this entry point but kept on disk for reference. They
// can be removed once we're confident nothing is needed from them.

function App() {
  return <RuntimeApp />;
}

export default App;
