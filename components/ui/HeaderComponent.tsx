import { useAppColors } from "@/hooks/useAppColors";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export function MainHeader({ children }: { children: React.ReactNode }) {
  const { gradient: { from, to } } = useAppColors();

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flexDirection: "row",
        height: "auto",
        borderBottomLeftRadius: children === undefined ? 0 : 30,
        borderBottomRightRadius: children === undefined ? 0 : 30,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingBottom: children === undefined ? 8 : 0,
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
