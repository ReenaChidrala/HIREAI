import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import 'react-native-gesture-handler';
import { RootNavigater } from './src/navigation/RootNavigation/root-navigate';

function App() {
  
  return (
    <SafeAreaProvider>
      <StatusBar  />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const backgrounderColor = isDarkMode ? "black ": "white" ; 
  return (
    <View style={[styles.container, { backgroundColor: backgrounderColor }]}>
      {/* <AuthTest /> */}
      <RootNavigater />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black' 
  },  // ✅ was missing flex:1
});

export default App;


