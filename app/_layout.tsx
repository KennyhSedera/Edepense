import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';

import {
  AppThemeProvider,
  useAppTheme,
} from '@/hooks/themeContext';
import { MainHeader } from '@/components/ui/HeaderComponent';
import { Image, Pressable, StatusBar, Text, TextInput, View } from 'react-native';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { styles } from '@/styles/styles';
import { useState } from 'react';

function Navigation() {
  const { navigationTheme, user } = useAppTheme();
  const router = useRouter();

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

  function HeaderWithSearch({ title }: { title: string }) {
    const [search, setSearch] = useState("");
    return (
      <MainHeader >
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
        </View>
      </MainHeader>
    )
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar
        backgroundColor={"transparent"}
        barStyle={"light-content"}
        translucent
      />

      <Stack initialRouteName={user === null ? 'index' : user === undefined ? 'index' : '(tabs)'}>

        <Stack.Screen name="login" options={{
          headerShown: false,
        }} />

        <Stack.Screen name="index" options={{
          headerShown: false,
        }} />

        <Stack.Screen name="globalSearch" options={{
          headerShown: true, header: () => <HeaderWithSearch title='Recherche' />
        }} />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="menu" options={{
          presentation: 'modal', headerShown: true, header: () => <FormHeader title='Menu' />
        }} />

        <Stack.Screen name="notification" options={{
          headerShown: true, header: () => <FormHeader title='Notifications' />
        }} />

        <Stack.Screen name="(detail)/detail-shopping" options={{
          headerShown: true, header: () => <FormHeader title={"Dépense détaillée"} />
        }} />

        <Stack.Screen name="(detail)/detail-budget" options={{
          headerShown: true, header: () => <FormHeader title={"Budget détaillé"} />
        }} />

        <Stack.Screen name="(detail)/detail-item" options={{
          headerShown: true, header: () => <FormHeader title={"Article détaillée"} />
        }} />

        <Stack.Screen name="(detail)/detail-provision" options={{
          headerShown: true, header: () => <FormHeader title={"Provision détaillée"} />
        }} />

        <Stack.Screen name="(form)/shopping-form" options={{
          headerShown: true, header: () => <FormHeader title={"Nouvelle dépense"} />
        }} />

        <Stack.Screen name="(form)/goal-form" options={{
          headerShown: true, header: () => <FormHeader title={"Nouvel objectif"} />
        }} />

        <Stack.Screen name="(form)/provision-form" options={{
          headerShown: true, header: () => <FormHeader title={"Nouvelle provision"} />
        }} />

        <Stack.Screen name="(form)/scan-ticket" options={{
          headerShown: true, header: () => <FormHeader title={"Scanner un ticket"} />
        }} />

        <Stack.Screen name="+not-found" options={{ headerShown: false }} />

      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Navigation />
    </AppThemeProvider>
  );
}