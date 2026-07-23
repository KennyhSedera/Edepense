import { View, Text, Pressable, TextInput, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { ChevronLeft, Search, XCircle } from 'lucide-react-native';
import { styles } from '@/styles/styles';
import { getCurrentSearch, setCurrentSearch } from '@/controller/search.controller';

export function HeaderWithSearch({ title, searchable }: { title: string; searchable: boolean }) {
  const { search: searchParam } = useLocalSearchParams();
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function restore() {
      if (searchParam) {
        setSearch(searchParam as string);
        return;
      }
      const last = await getCurrentSearch();
      if (last) {
        setSearch(last);
        router.setParams({ search: last });
      }
    }
    if (searchable) restore();
  }, []);

  const handleChangeText = (text: string) => {
    setSearch(text);
    router.setParams({ search: text });
    setCurrentSearch(text);
  };

  const handleClear = () => {
    setSearch("");
    router.setParams({ search: "" });
    setCurrentSearch("");
  };

  return (
    <View style={[styles.rowSpacing]}>
      {title && (
        <View style={[styles.header, { paddingTop: 0, gap: 10, width: "100%" }]}>
          <View style={[styles.rowSpacing]}>
            <Pressable onPress={() => router.back()}>
              <ChevronLeft size={28} color={"white"} />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
              {title}
            </Text>
          </View>
          <Pressable onPress={() => router.push(`/globalSearch`)}>
            <Search size={28} color={"white"} />
          </Pressable>
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
            width: "100%",
            gap: 10
          }}
        >
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={32} color={"white"} />
          </Pressable>
          <View style={{
            position: 'relative', width: '80%', height: 40
          }}>
            {search && <Pressable onPress={handleClear}
              style={{ position: 'absolute', right: 10, top: 8, zIndex: 1 }}
            >
              <XCircle size={18} color={'#ececec'} />
            </Pressable>}
            <TextInput
              placeholder="Rechercher..."
              placeholderTextColor={"#ececec"}
              value={search}
              onChangeText={handleChangeText}
              style={{
                flex: 1,
                padding: 10,
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
    </View>
  )
}

export default function GuestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='globalSearch' />
      <Stack.Screen name='menu' />
      <Stack.Screen name='notification' />
      <Stack.Screen name='profile' />
      <Stack.Screen name='setting' />
      <Stack.Screen name='budget' />
      <Stack.Screen name='notes-vocales' />
      <Stack.Screen name='image-enregistrer' />
      <Stack.Screen name='todo-screen' />
      <Stack.Screen name='course-screen' />
      <Stack.Screen name='faq' />
    </Stack>
  )
}