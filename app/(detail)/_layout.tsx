import React from 'react'
import { router, Stack } from 'expo-router'
import { MainHeader } from '@/components/header/header-component'
import { Image, Pressable, Text, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { styles } from '@/styles/styles'

export function DetailHeader({ title }: { title: string }) {
  return (
    <View
      style={{ width: "100%" }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={24} color={"white"} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {title}
          </Text>
        </View>

        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
      </View>
    </View>
  )
}

export default function DetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, }}>
      <Stack.Screen name='detail-shopping' />
      <Stack.Screen name='detail-budget' />
      <Stack.Screen name='detail-item' />
      <Stack.Screen name='detail-provision' />
    </Stack>
  )
}