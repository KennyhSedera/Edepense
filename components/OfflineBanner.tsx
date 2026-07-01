import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected === true && state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Pas de connexion internet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#D32F2F',
    paddingVertical: 6,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});