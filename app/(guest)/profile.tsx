import { useAppTheme } from "@/hooks/themeContext";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/Colors";
import Toggle from "@/components/ui/Toggle";

export default function ProfileScreen() {
  const { colors, dark } = useTheme();
  const { setThemeMode } = useAppTheme();
  const colorScheme = dark ? "dark" : "light";
  const textColor = Colors[colorScheme ?? "light"].text;
  const backgroundColor = Colors[colorScheme ?? "light"].background;
  const [enabled, setEnabled] = useState(dark);

  const handleChangeTheme = async (theme: boolean) => {
    setEnabled(theme);
    await setThemeMode(theme ? "dark" : "light");
  };

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
          gap: 8,
          paddingInline: 2,
        }}>
        <Pressable style={[styles.card, { backgroundColor }]}></Pressable>
        <Pressable style={[styles.card, { backgroundColor }]}></Pressable>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor, padding: 12, marginVertical: 10, borderRadius: 10 }}>
        <Text style={[styles.title, { color: textColor }]}>Mode sombre</Text>
        <Toggle value={enabled} onChange={handleChangeTheme} />
      </View>
    </ScrollView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 10
  },
  text: {
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "100%",
  },
  card: {
    paddingBlock: 20,
    paddingInline: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "column",
    gap: 20,
    width: "48%",
  },
});
