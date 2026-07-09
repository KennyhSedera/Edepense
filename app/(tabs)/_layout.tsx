import { router, Tabs, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, Pressable, StatusBar, Text, TextInput, View } from "react-native";
import CustomTabBar from "@/components/ui/CustomTabBar";
import { Apple, Bell, CircleDollarSignIcon, LayoutGrid, Menu, Search, ShoppingBasket } from "lucide-react-native";
import { styles } from "@/styles/styles";
import { getUser } from "@/controller/user.controller";
import { useAppColors } from "@/hooks/useAppColors";
import { st } from '@/components/header/animate-header';

export function HomeHeader() {
  return (
    <View style={{ width: "100%" }}>
      <View
        style={styles.header}
      >
        <Pressable onPress={() => router.push("/start")} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              objectFit: "cover",
              backgroundColor: "white",
              padding: 4,
            }}
          />

          <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>
            E-Dépense
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <Pressable onPress={() => router.push("/notification")}>
            <Bell size={22} color={"white"} />
          </Pressable>

          <Pressable onPress={() => router.push("/menu")}>
            <Menu size={24} color={"white"} />
          </Pressable>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 12,
          paddingBottom: 10,
          marginTop: 5,
        }}
      >
        <Pressable
          onPress={() => router.push('/globalSearch')}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#eeeeee1a",
            borderColor: "#eeeeee4f",
            borderWidth: 1,
            borderRadius: 100,
            paddingHorizontal: 10,
            marginBottom: 5,
          }}
        >
          <Search size={18} color="#ececec" />
          <Text
            style={{
              flex: 1,
              padding: 8,
              fontSize: 16,
              color: "#ececec",
            }}
          >Rechercher...
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export function TabHeader({ title }: { title: string }) {
  const [search, setSearch] = useState("");
  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        marginTop: 0,
        width: "100%",
        gap: 2,
      }}
    >
      <View style={[styles.itemTopRow, { justifyContent: "space-between", paddingHorizontal: 5 }]}>
        <Text style={[styles.title, { color: "white" }]}>{title}</Text>
        <Image
          source={require("@/assets/images/logo.png")}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            objectFit: "cover",
            backgroundColor: "white",
            padding: 4,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#eeeeee1a",
          borderColor: "#eeeeee4f",
          borderWidth: 1,
          borderRadius: 100,
          paddingHorizontal: 10,
          marginBottom: 5,
        }}
      >
        <Search size={18} color={"white"} />

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
          }}
        />
      </View>
    </View>
  )
}
export default function TabLayout() {
  const { textColor, tintColor } = useAppColors();

  return (
    <>
      <StatusBar
        backgroundColor={"transparent"}
        barStyle={"light-content"}
        translucent
      />
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => (
          <CustomTabBar {...props} />
        )}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Accueil",
            tabBarIcon: ({ color, focused }) => (
              <LayoutGrid size={focused ? 34 : 24} color={color} />
            ),
            tabBarActiveTintColor: tintColor,
          }}
        />
        <Tabs.Screen
          name="shopping"
          options={{
            title: "Courses",
            tabBarIcon: ({ color, focused }) => (
              <ShoppingBasket size={focused ? 39 : 24} color={color} />
            ),
            tabBarActiveTintColor: tintColor,

          }}
        />
        <Tabs.Screen
          name="provision"
          options={{
            title: "Provisions",
            tabBarIcon: ({ color, focused }) => (<Apple size={focused ? 36 : 24} color={color} />),
            tabBarActiveTintColor: tintColor,
            tabBarIconStyle: {
              color: textColor,
              fontSize: 16,
            },
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            tabBarIcon: ({ color, focused }) => (
              <CircleDollarSignIcon size={focused ? 34 : 24
              } color={color} />
            ),
            tabBarActiveTintColor: tintColor,
          }}
        />
      </Tabs>
    </>
  );
}
