import React, { } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useAppColors } from "@/hooks/useAppColors";
import { AnimateHeaderProps } from "@/types/global";
import { styles } from "@/styles/styles";

export default function AnimatedHeader({
  children,
  header,
  maxHeight = 220,
  minHeight = 80,
}: AnimateHeaderProps) {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const { gradient } = useAppColors();

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, maxHeight - minHeight],
      [maxHeight, minHeight],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[
          styles.headerAnimated,
          headerStyle,
        ]}
      >
        <LinearGradient
          colors={[gradient.from, gradient.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            {
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }
          ]}
        />{header(scrollY)}</Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: maxHeight + 10,
            paddingBottom: 30,
          }]}
      >{children}</Animated.ScrollView>
    </View>
  );
}
