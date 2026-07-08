import { useAppColors } from "@/hooks/useAppColors";
import { View, Dimensions, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Path,
} from "react-native-svg";
import { st } from "@/components/header/animate-header";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "@/styles/styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function MainHeader({ children, height = 100, header, footer, paddinBottom = 8, fab }: { children: React.ReactNode, height?: number, header: () => React.ReactNode, footer?: () => React.ReactNode, paddinBottom?: number, fab?: React.ReactNode }) {
  const { gradient: { from, to }, backgroundColor } = useAppColors();
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
    <View style={{ flex: 1 }}>
      <View style={[st.headerAnimated]}>
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
              paddingBottom: header === undefined ? paddinBottom : dripZone + 4,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {header()}
          </View>
        </SafeAreaView>
      </View>
      <View style={{ flex: 1, position: "relative" }}>
        {fab}
        <ScrollView
          contentContainerStyle={{
            paddingTop: height + paddinBottom,
            paddingBottom: 30,
            paddingHorizontal: 8,
          }}
        >{children}</ScrollView>
      </View>
      {footer &&
        <LinearGradient
          colors={[from, to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.linearGradient}
        >
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {footer()}
          </View>
        </LinearGradient>}
    </View>
  );
}
