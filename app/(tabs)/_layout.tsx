import { Tabs, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, Pressable, StatusBar, Text, TextInput, View } from "react-native";
import CustomTabBar from "@/components/ui/CustomTabBar";
import { MainHeader } from "@/components/ui/HeaderComponent";
import { Apple, Bell, CircleDollarSignIcon, LayoutGrid, Menu, Search, ShoppingBasket } from "lucide-react-native";
import { styles } from "@/styles/styles";
import { getUser } from "@/controller/user";
import { useAppColors } from "@/hooks/useAppColors";

export default function TabLayout() {
  const { textColor, tintColor } = useAppColors();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      async function loadUser() {
        const user = await getUser();

      }

      loadUser();
    }, [getUser])
  );

  function HomeHeader() {
    return (
      <MainHeader>
        <View style={{ width: "100%" }}>
          <View
            style={styles.header}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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
            </View>

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
      </MainHeader>
    )
  }

  function ShoppingHeader({ title }: { title: string }) {
    const [search, setSearch] = useState("");
    return (
      <MainHeader >
        <View
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginTop: 5,
            width: "100%",
            gap: 10
          }}
        >
          <View style={[styles.itemTopRow, { justifyContent: "space-between" }]}>
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
      </MainHeader>
    )
  }

  return (
    <>
      <StatusBar
        backgroundColor={"transparent"}
        barStyle={"light-content"}
        translucent
      />
      <Tabs
        initialRouteName="index"
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
            header: () => <HomeHeader />
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
            header: () => <ShoppingHeader title="🛒 Mes achats (Dépenses)" />
          }}
        />
        <Tabs.Screen
          name="provision"
          options={{
            header: () => <ShoppingHeader title="🛒 Mes provisions" />,
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
            header: () => <ShoppingHeader title="🛒 Mes budgets" />
          }}
        />
      </Tabs>
    </>
  );
}
