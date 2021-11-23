import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';

import Gminor from './component/Gminor';

const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Gminor />
    </View >
  );
};

export default App;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
