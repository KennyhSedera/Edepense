// components/ui/floating-action-button.tsx
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAppColors } from "@/hooks/useAppColors";
import { Position } from "@/types/global";

export type ScrollFabMode =
  | "hide-on-scroll-down"
  | "show-when-scrolled-up"
  | "show-after-leaving-top";

export function useScrollFab(
  mode: ScrollFabMode = "hide-on-scroll-down"
) {
  const hiddenAtStart =
    mode === "show-when-scrolled-up" ||
    mode === "show-after-leaving-top";

  const translateY = useSharedValue(hiddenAtStart ? 120 : 0);
  const opacity = useSharedValue(hiddenAtStart ? 0 : 1);
  const lastOffset = useSharedValue(0);

  const show = () => {
    translateY.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(1, { duration: 200 });
  };

  const hide = () => {
    translateY.value = withTiming(120, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const onScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } =
      event.nativeEvent;

    const currentOffset = Math.max(0, contentOffset.y);
    const diff = currentOffset - lastOffset.value;

    if (mode === "hide-on-scroll-down") {
      if (currentOffset < 50) show();
      else if (diff > 5) hide();
      else if (diff < -5) show();
    }

    if (mode === "show-when-scrolled-up") {
      const maxOffset = Math.max(
        0,
        contentSize.height - layoutMeasurement.height
      );
      const distanceFromBottom = maxOffset - currentOffset;

      distanceFromBottom > 100 ? show() : hide();
    }

    if (mode === "show-after-leaving-top") {
      currentOffset <= 250 ? hide() : show();
    }

    lastOffset.value = currentOffset;
  };

  return { translateY, opacity, onScroll };
}

export function FloatingActionButton({
  translateY,
  opacity,
  onPress,
  icon,
  position = {
    width: 56,
    height: 56,
    bottom: 24,
    right: 20,
  },
}: {
  translateY: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  onPress: () => void;
  icon: React.ReactNode;
  position?: Position;
}) {
  const { sectionColor } = useAppColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          top: position?.top,
          right: position?.right ?? 20,
          bottom: position?.bottom ?? 24,
          left: position?.left,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.fab,
          {
            backgroundColor: sectionColor,
            width: position?.width ?? 56,
            height: position?.height ?? 56,
          },
        ]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    zIndex: 999,
  },
  fab: {
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});