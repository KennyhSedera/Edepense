import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface HeaderDripAnimatedProps {
  scrollY: SharedValue<number>;
  title: string;
  subtitle?: string;
  maxHeight?: number;
  minHeight?: number;
  children?: React.ReactNode;
}

export default function HeaderDripAnimated({
  scrollY,
  title,
  subtitle,
  maxHeight = 220,
  minHeight = 90,
  children,
}: HeaderDripAnimatedProps) {
  const range = maxHeight - minHeight;

  const mount = useSharedValue(0);
  useEffect(() => {
    mount.value = withTiming(1, { duration: 600 });
  }, []);

  const titleStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, range], [1, 0.72], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, range], [0, -8], Extrapolation.CLAMP);
    const mountTranslateY = interpolate(mount.value, [0, 1], [16, 0]);

    return {
      opacity: mount.value,
      transform: [{ scale }, { translateY: translateY + mountTranslateY }],
    };
  });

  const subtitleStyle = useAnimatedStyle(() => {
    const scrollOpacity = interpolate(scrollY.value, [0, range * 0.5], [1, 0], Extrapolation.CLAMP);
    const mountTranslateY = interpolate(mount.value, [0, 1], [12, 0]);

    return {
      opacity: mount.value * scrollOpacity,
      transform: [{ translateY: mountTranslateY }],
    };
  });

  const childrenStyle = useAnimatedStyle(() => {
    const scrollOpacity = interpolate(scrollY.value, [0, range * 0.5], [1, 0], Extrapolation.CLAMP);
    const mountTranslateY = interpolate(mount.value, [0, 1], [10, 0]);

    return {
      opacity: mount.value * scrollOpacity,
      transform: [{ translateY: mountTranslateY }],
    };
  });

  return (
    <View>
      <Animated.Text style={[st.title, titleStyle]}>{title}</Animated.Text>

      {subtitle && (
        <Animated.Text style={[st.subtitle, subtitleStyle]}>{subtitle}</Animated.Text>
      )}

      {children && <Animated.View style={childrenStyle}>{children}</Animated.View>}
    </View>
  );
}

const st = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
});