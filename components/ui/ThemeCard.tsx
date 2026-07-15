import { Colors } from "@/constants/Colors";
import { Pressable, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles as style } from "@/styles/styles";
import { useAppColors } from "@/hooks/useAppColors";

export const ThemeCard = (
  { darkMode, selected, title, onPress, }:
    { darkMode: boolean; selected: boolean; title: string; onPress: () => void; }
) => {
  const { info, white } = useAppColors();
  return (
    <Pressable onPress={onPress} style={{ width: "49.5%" }}>
      <View style={[style.cardMode, { borderWidth: 3, borderColor: selected ? info : 'transparent', },]}  >
        <LinearGradient
          colors={[Colors[darkMode ? "dark" : "light"].from, Colors[darkMode ? "dark" : "light"].to,]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[style.linearMode, { height: "auto", padding: 10, paddingVertical: 15 }]}
        >
          <View style={[style.cardModeContent, darkMode && { backgroundColor: "#000" },]} >
            <View style={[style.cardTextMode, { width: darkMode ? "30%" : "45%", backgroundColor: darkMode ? white : "#000", },]} />
            <View style={[style.cardTextMode, { backgroundColor: darkMode ? white : "#000" },]} />
          </View>
        </LinearGradient>
      </View>

      <Text style={[style.textMode, { color: selected ? info : (!darkMode ? white : '#000') },]}>
        {title}
      </Text>
    </Pressable>
  )
};