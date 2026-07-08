import { useAppColors } from "@/hooks/useAppColors";
import { View, Dimensions, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function MainHeader({ children, height = 100 }: { children: React.ReactNode, height?: number }) {
  const { gradient: { from, to } } = useAppColors();
  const w = SCREEN_WIDTH;
  const h = height;
  const dripZone = children === undefined ? 0 : 14;

  const topY = h - dripZone;

  const dripPath = `
    M0,0 
    L${w},0 
    L${w},${topY}
    C${w * 0.92},${topY} ${w * 0.9},${h} ${w * 0.8},${h}
    C${w * 0.72},${h} ${w * 0.71},${topY} ${w * 0.62},${topY}
    C${w * 0.54},${topY} ${w * 0.53},${h} ${w * 0.42},${h}
    C${w * 0.33},${h} ${w * 0.32},${topY} ${w * 0.23},${topY}
    C${w * 0.16},${topY} ${w * 0.15},${h} ${w * 0.08},${h}
    C${w * 0.03},${h} 0,${topY} 0,${topY}
    Z
  `;

  return (
    <View style={{ width: "100%" }}>
      <Svg
        width={w}
        height={h}
        style={[StyleSheet.absoluteFillObject, st.shadow]}
        viewBox={`0 0 ${w} ${h}`}
      >
        <Defs>
          <SvgLinearGradient id="mainHeaderGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </SvgLinearGradient>
        </Defs>
        <Path d={dripPath} fill="url(#mainHeaderGrad)" />
      </Svg>

      <SafeAreaView edges={["top"]}>
        <View
          style={{
            minHeight: h - dripZone,
            paddingBottom: children === undefined ? 8 : dripZone + 4,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});