import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import { router } from "expo-router";
import { CameraIcon, ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View, Image, StatusBar } from "react-native";

import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type Props = {
  scrollY: SharedValue<number>;
  avatar?: string | null;
  title?: string;
  subtitle?: string;
  action?: (v?: string | number | object | null | undefined | boolean) => void;
  children?: React.ReactNode;
};

export default function HeaderProfile({
  scrollY,
  avatar,
  title = "Modifier mon profil",
  subtitle = "Informations personnelles",
  action,
  children,
}: Props) {
  const { sectionColor } = useAppColors();

  const mainHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 120], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 120], [0, -30], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(scrollY.value, [0, 120], [1, 0.85], Extrapolation.CLAMP),
      },
    ],
  }));

  const mainAvatarStyle = useAnimatedStyle(() => {
    const size = interpolate(scrollY.value, [0, 120], [120, 80], Extrapolation.CLAMP);
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  const mainTitleStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(scrollY.value, [0, 120], [28, 20], Extrapolation.CLAMP),
  }));

  const topBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [60, 120], [0, 1], Extrapolation.CLAMP),
  }));

  const miniAvatarStyle = useAnimatedStyle(() => {
    const size = interpolate(scrollY.value, [60, 120], [0, 32], Extrapolation.CLAMP);

    return {
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.rowSpacing, { marginTop: StatusBar.currentHeight, paddingVertical: 10, }]} >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Animated.Text
            style={[
              { color: "#fff", fontSize: 16, fontWeight: "600", },
              topBarStyle,
            ]}
          >
            {title}
          </Animated.Text>
        </View>
        <Animated.Image
          source={avatar ? { uri: avatar } : require("@/assets/images/avatar.png")}
          style={[
            { width: 32, height: 32, },
            miniAvatarStyle,
            topBarStyle,
          ]}
        />
      </View>

      <Animated.View
        style={[
          { alignItems: "center", justifyContent: "flex-end", paddingBottom: 20, },
          mainHeaderStyle,
        ]}
      >

        <View style={{ alignItems: "center", justifyContent: "center", position: "relative", }}>
          {action && <Pressable onPress={action} style={{ position: "absolute", bottom: 15, right: 5, zIndex: 1, padding: 5, backgroundColor: sectionColor, borderRadius: 100, borderWidth: 1, borderColor: "#fff" }}>
            <CameraIcon size={20} color="#fff" />
          </Pressable>}
          <Animated.Image
            source={avatar ? { uri: avatar } : require("@/assets/images/avatar.png")}
            style={[
              mainAvatarStyle,
              { marginBottom: 10, borderWidth: 2, borderColor: "#fff", },
            ]}
          />
        </View>
        <Animated.Text
          style={[
            { color: "#fff", fontWeight: "700", },
            mainTitleStyle,
          ]}
        >
          {title}
        </Animated.Text>
        <Text style={{ color: "#fff", opacity: 0.8 }}>
          {subtitle}
        </Text>
        {children}
      </Animated.View>

    </View>
  );
}