import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Stack } from 'expo-router'
import { MainHeader } from '@/components/ui/HeaderComponent';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { styles } from '@/styles/styles';

function HeaderWithSearch({ title, searchable }: { title: string; searchable: boolean }) {
  const [search, setSearch] = useState("");
  return (
    <MainHeader >
      {title && (
        <View style={[styles.header, { paddingTop: 10, gap: 10, paddingBottom: 10, }]}>
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={28} color={"white"} />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: "600", color: "white", marginTop: 5 }}>
            {title}
          </Text>
        </View>
      )}
      {searchable && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 12,
            paddingLeft: 5,
            paddingVertical: 10,
            marginTop: 5,
            width: "100%",
            gap: 10
          }}
        >
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={32} color={"white"} />
          </Pressable>
          <View style={{
            position: 'relative', width: '80%', height: 45
          }}>
            {search && <Pressable onPress={() => {
              setSearch("");
              router.setParams({ search: "" });
            }}
              style={{ position: 'absolute', right: 10, top: 12, zIndex: 1 }}
            >
              <X size={22} color={'#ececec'} />
            </Pressable>}
            <TextInput
              placeholder="Rechercher..."
              placeholderTextColor={"#ececec"}
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                router.setParams({ search: text });
              }}
              style={{
                flex: 1,
                padding: 8,
                fontSize: 16,
                color: "white",
                backgroundColor: "#eeeeee1a",
                borderColor: "#eeeeee4f",
                borderWidth: 1,
                borderRadius: 50,
                paddingHorizontal: 20,
              }}
            />
          </View>
          <Search size={28} color={"white"} />
        </View>)}
    </MainHeader>
  )
}

export default function GuestLayout() {

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name='globalSearch' options={{ header: () => <HeaderWithSearch title='' searchable={true} /> }} />
      <Stack.Screen name='menu' options={{ header: () => <HeaderWithSearch title='Menu' searchable={false} /> }} />
      <Stack.Screen name='notification' options={{ header: () => <HeaderWithSearch title='Notification' searchable={false} /> }} />
      <Stack.Screen name='profile' options={{ header: () => <HeaderWithSearch title='Profile' searchable={false} /> }} />
    </Stack>
  )
}