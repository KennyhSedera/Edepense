import { Colors } from "@/constants/Colors";
import { STORAGE_THEME_KEY } from "@/constants/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export function MainHeader({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const loadTheme = async () => {
      const theme = await AsyncStorage.getItem(STORAGE_THEME_KEY);
      setColorScheme(theme === "dark" ? "dark" : "light");
    };

    loadTheme();
  }, []);

  const from = Colors[colorScheme].from;
  const to = Colors[colorScheme].to;

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flexDirection: "row",
        height: "auto",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            height: "auto",
            paddingHorizontal: 4,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
