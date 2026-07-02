import React from 'react'
import { router, Stack } from 'expo-router'
import { MainHeader } from '@/components/ui/HeaderComponent'
import { Image, Pressable, Text, View } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { styles } from '@/styles/styles'

function Header({ title }: { title: string }) {
  return (
    <MainHeader>
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
            <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
              {title}
            </Text>
          </View>

          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />
        </View>
      </View>
    </MainHeader>
  )
}

export default function DetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, }}>
      <Stack.Screen name='detail-shopping' options={{ header: () => <Header title='Dépense détaillée' /> }} />
      <Stack.Screen name='detail-budget' options={{ header: () => <Header title='Budget détaillé' /> }} />
      <Stack.Screen name='detail-item' options={{ header: () => <Header title='Article détaillée' /> }} />
      <Stack.Screen name='detail-provision' options={{ header: () => <Header title='Provision détaillé' /> }} />
    </Stack>
  )
}