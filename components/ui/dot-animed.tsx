import { useAppColors } from "@/hooks/useAppColors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

function Dot({ delay, options }: { delay: number, options?: any }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const { textColor } = useAppColors();

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scale, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 350,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ scale }],
          opacity: scale,
          backgroundColor: textColor,
          ...options,
        },
      ]}
    />
  );
}

export default function ThreeDotsLoader({ width = 8, height = 8, color, style }: {
  width?: number,
  height?: number,
  color?: string,
  style?: StyleProp<ViewStyle>
}
) {
  return (
    <View style={styles.container}>
      <Dot delay={0} options={{ width, height, color, style }} />
      <Dot delay={200} options={{ width, height, color, style }} />
      <Dot delay={400} options={{ width, height, color, style }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    borderRadius: 4,
    marginHorizontal: 4,
  },
});