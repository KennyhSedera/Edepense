import { useAppColors } from "@/hooks/useAppColors";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

export default function Toggle({ value, onChange }: any) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const { isDark } = useAppColors();

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const toggle = () => {
    onChange(!value);
  };

  return (
    <Pressable
      onPress={toggle}
      style={{
        width: 50,
        height: 28,
        borderRadius: 20,
        backgroundColor: value ? "#0167ff" : isDark ? "#000000" : "#ffffff",
        borderWidth: 2,
        borderColor: "#0167ff",
        paddingVertical: 2,
        paddingHorizontal: 3,
      }}
    >
      <Animated.View
        style={{
          width: 20,
          height: 20,
          borderRadius: 12,
          backgroundColor: value ? "#fff" : isDark ? "#ffffff" : "#000000",
          transform: [{ translateX }],
        }}
      />
    </Pressable>
  );
}