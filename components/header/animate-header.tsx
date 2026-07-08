import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions, Text, Image } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,

} from "react-native-svg";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { useAppColors } from "@/hooks/useAppColors";
import { AnimateHeaderProps } from "@/types/global";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function AnimatedHeader({
  children,
  header,
  maxHeight = 220,
  minHeight = 80,
  marginBottomMax = 80,
  marginBottomMin = 0,
  topTitle = true,
}: AnimateHeaderProps) {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const { gradient } = useAppColors();

  const range = maxHeight - minHeight;
  const w = SCREEN_WIDTH;

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, range],
      [maxHeight, minHeight],
      Extrapolation.CLAMP
    ),
  }));

  const wave = useSharedValue(0);
  useEffect(() => {
    wave.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    "worklet";

    const collapse = interpolate(scrollY.value, [0, range], [0, 1], Extrapolation.CLAMP);
    const h = interpolate(collapse, [0, 1], [maxHeight, minHeight], Extrapolation.CLAMP);
    const dripIntensity = interpolate(collapse, [0, 1], [1, 0.2], Extrapolation.CLAMP);

    const dripZone = interpolate(collapse, [0, 1], [40, 12], Extrapolation.CLAMP);
    const topY = h - dripZone;

    const t = wave.value * dripIntensity;
    const amp1 = 8 * t;
    const amp2 = 6 * t;
    const amp3 = 5 * t;

    const clamp = (v: number) => Math.min(v, h);
    const d1 = clamp(topY + dripZone * 0.85 + amp1);
    const d2 = clamp(topY + dripZone * 1.0 + amp2);
    const d3 = clamp(topY + dripZone * 0.9 + amp3);

    const d = `
      M0,0 
      L${w},0 
      L${w},${topY}
      C${w * 0.92},${topY} ${w * 0.9},${d1} ${w * 0.8},${d1}
      C${w * 0.72},${d1} ${w * 0.71},${topY} ${w * 0.62},${topY}
      C${w * 0.54},${topY} ${w * 0.53},${d2} ${w * 0.42},${d2}
      C${w * 0.33},${d2} ${w * 0.32},${topY} ${w * 0.23},${topY}
      C${w * 0.16},${topY} ${w * 0.15},${d3} ${w * 0.08},${d3}
      C${w * 0.03},${d3} 0,${topY} 0,${topY}
      Z
    `;

    return { d };
  });

  const headerContentStyle = useAnimatedStyle(() => ({
    marginBottom: interpolate(
      scrollY.value,
      [0, range],
      [marginBottomMax, marginBottomMin - 20],
      Extrapolation.CLAMP
    ),
  }));

  const topTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, range],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[st.headerAnimated, headerStyle]}>
        <Svg
          width={w}
          height={maxHeight}
          style={[StyleSheet.absoluteFillObject, st.shadow]}
          viewBox={`0 0 ${w} ${maxHeight}`}
        >
          <Defs>
            <SvgLinearGradient id="dripGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradient.from} />
              <Stop offset="1" stopColor={gradient.to} />
            </SvgLinearGradient>
          </Defs>
          <AnimatedPath animatedProps={animatedProps} fill="url(#dripGrad)" />
        </Svg>

        {topTitle && (
          <Animated.View entering={FadeInDown.duration(600).springify()}>
            <Animated.View style={[st.topHeader, topTitleStyle]}>
              <Image source={require("@/assets/images/logo.png")} style={{ width: 28, height: 28 }} />
              <Text style={[st.title]}>E-Dépense</Text>
            </Animated.View>
          </Animated.View>
        )}

        <Animated.View style={[st.headerContent, headerContentStyle]}>
          {header(scrollY)}
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: maxHeight + 10,
          paddingBottom: 30,
          paddingHorizontal: 8,
        }}
      >
        {children}
      </Animated.ScrollView>
    </View>
  );
}

export const st = StyleSheet.create({
  headerAnimated: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 100,
  },
  footerAnimated: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 100,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-end",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topHeader: {
    position: "absolute",
    top: 40,
    left: 20,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});