import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { styles } from '@/styles/styles';
import { useAuth } from '@/contexts/AuthContext';
import { useAppColors } from '@/hooks/useAppColors';

export function FormHeader({ title }: { title: string }) {
  const { user } = useAuth();
  const image = user?.avatar;
  const { sectionColor } = useAppColors();

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
          <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
            {title}
          </Text>
        </View>

        <Image
          source={image ? { uri: image } : require("@/assets/images/logo.png")}
          style={[styles.logo, { borderColor: sectionColor, borderWidth: 1 }]}
        />
      </View>
    </View>
  )
}

export default function FormLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='goal-form' />
      <Stack.Screen name='shopping-form' />
      <Stack.Screen name='provision-form' />
      <Stack.Screen name='budget-form' />
      <Stack.Screen name='scan-ticket' />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name='voice-recorder' />
      <Stack.Screen name='type-whatsapp' />
      <Stack.Screen name='todo-form' />
      <Stack.Screen name='course-form' />
    </Stack>
  );
}