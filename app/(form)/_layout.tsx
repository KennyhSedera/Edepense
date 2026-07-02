import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import { router, Stack } from 'expo-router';
import { MainHeader } from '@/components/ui/HeaderComponent';
import { ChevronLeft } from 'lucide-react-native';
import { styles } from '@/styles/styles';

function FormHeader({ title }: { title: string }) {
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

export default function FormLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name='goal-form' options={{ header: () => <FormHeader title="Formulaire d'objectif" /> }} />
      <Stack.Screen name='shopping-form' options={{ header: () => <FormHeader title="Formulaire de dépense" /> }} />
      <Stack.Screen name='provision-form' options={{ header: () => <FormHeader title="Formulaire de produit" /> }} />
      <Stack.Screen name='scan-ticket' options={{ header: () => <FormHeader title="Scanner un ticket" /> }} />
    </Stack>
  );
}