import { View, Image } from 'react-native'
import React, { useCallback } from 'react'
import { } from 'react-native';
import { useAppTheme } from '@/hooks/themeContext';
import { router, useFocusEffect } from 'expo-router';

export default function index() {
  const { theme } = useAppTheme();

  useFocusEffect(
    useCallback(() => {
      //     async function loadUser() {
      //       const user = await getUser();
      //       if (user === null || user === undefined) {
      //         router.push("/login");
      //       } else {
      router.push("/(tabs)");
      //       }
      //     }

      //     loadUser();
    }, [])
  )

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme === "dark" ? "black" : "white" }}>
      <Image source={require("@/assets/images/logo.png")} style={{ width: 200, height: 200 }} />
    </View>
  )
}