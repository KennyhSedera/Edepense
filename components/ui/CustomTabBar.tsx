import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: any) {
  const { dark } = useTheme();
  const { gradient, backgroundColor, tintColor, tabIconSelected } = useAppColors();

  return (
    <LinearGradient
      colors={[gradient.from, gradient.to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flexDirection: "row",
        height: "auto",
        backgroundColor,
        borderRadius: 100,
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginVertical: 10,
        paddingVertical: 8,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;

        const { options } = descriptors[route.key];

        return (
          <Pressable
            key={route.key}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.navigate(route.name)}
          >
            {options.tabBarIcon?.({
              focused,
              color: focused ? tabIconSelected : dark ? "#b6b6b6" : "#d1d1d1",
            })}

            <Text
              style={{
                color: focused ? tintColor : dark ? "#b6b6b6" : "#d1d1d1",
                fontSize: 12,
                display: !focused ? "flex" : "none",
              }}
            >
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}