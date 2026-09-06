import React from 'react';
import { requireNativeComponent, View, StyleSheet, Platform } from 'react-native';

// Связываем с нативным именем "MyTargetView", которое мы указали в getName()
const NativeMyTargetView = requireNativeComponent('MyTargetView');

const MyTargetBanner = ({ slotId, adSize = '320x50', style }) => {
  if (Platform.OS !== 'android') {
    return null; // Пока делаем только для Android
  }

  return (
    <View style={[styles.container, style]}>
      <NativeMyTargetView
        slotId={String(slotId)}
        adSize={adSize}
        style={styles.banner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 5,
  },
  banner: {
    width: 320,
    height: 50,
  },
});

export default MyTargetBanner;