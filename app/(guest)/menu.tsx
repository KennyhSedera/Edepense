import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/themeContext';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles as style } from "@/styles/styles";
import { useAppColors } from '@/hooks/useAppColors';
import { useHours } from '@/hooks/useHour';

export default function Menu() {
  const { colors, dark } = useTheme();
  const { setThemeMode, user } = useAppTheme();
  const { textColor, inputBg, border, cardBg, isDark, sectionColor } = useAppColors(); const {
    hour,
    enabled,
    disableNotifications,
    enableNotifications,
    handleHourChange
  } = useHours();

  const handleChangeTheme = async (theme: boolean) => {
    await setThemeMode(theme ? "dark" : "light");
  };

  const handleToggle = async (value: boolean) => {
    value ? await enableNotifications() : await disableNotifications();
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[style.card, style.infoGridFull, { backgroundColor: cardBg, borderColor: border, }]}>

        <Text style={[style.title, { color: textColor }]}>{user?.name}</Text>
        <Text style={[style.category, { color: textColor }]}>{user?.email}</Text>
      </View>
      <View style={[style.grid, { marginVertical: 6 }]}>
        <Pressable onPress={() => handleChangeTheme(false)} style={{ width: "48%" }}>
          <View style={[styles.card, { borderWidth: !dark ? 3 : 0, borderColor: isDark ? border : colors.primary }]}>
            <LinearGradient colors={[Colors["light"].from, Colors["light"].to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.linear]}>
              <View style={[styles.cardMode]}>
                <View style={[styles.cardTextMode, { width: "45%" }]} />
                <View style={[styles.cardTextMode]} />
              </View>
              <View style={[styles.cardMode]}>
                <View style={[styles.cardTextMode, { width: "45%" }]} />
                <View style={[styles.cardTextMode]} />
              </View>
            </LinearGradient>
          </View>
          <Text style={[styles.textMode, { color: isDark ? textColor : colors.primary }]}>Mode Claire</Text>
        </Pressable>
        <Pressable onPress={() => handleChangeTheme(true)} style={{ width: "48%" }}>
          <View style={[styles.card, , { borderColor: !isDark ? border : colors.primary, borderWidth: dark ? 3 : 0, }]}>
            <LinearGradient colors={[Colors["dark"].from, Colors["dark"].to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.linear]}>
              <View style={[styles.cardMode, { backgroundColor: "#000000" }]}>
                <View style={[styles.cardTextMode, { width: "30%", backgroundColor: "#fff" }]} />
                <View style={[styles.cardTextMode, { width: "100%", backgroundColor: "#fff" }]} />
              </View>
              <View style={[styles.cardMode, { backgroundColor: "#000000" }]}>
                <View style={[styles.cardTextMode, { width: "30%", backgroundColor: "#fff" }]} />
                <View style={[styles.cardTextMode, { width: "100%", backgroundColor: "#fff" }]} />
              </View>
            </LinearGradient>
          </View>
          <Text style={[styles.textMode, { color: !isDark ? textColor : colors.primary }]}>Mode Sombre</Text>
        </Pressable>
      </View>

      <View style={{ marginVertical: 20, padding: 10, borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 16, color: textColor }}>Rappel quotidien</Text>
          <Switch value={enabled} onValueChange={handleToggle} />
        </View>

        {enabled && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[12, 14, 16, 18, 20, 21, 22].map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => handleHourChange(h)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: hour === h ? sectionColor : inputBg,
                }}
              >
                <Text style={{ color: hour === h ? '#fff' : textColor }}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    height: "auto", padding: 3, borderRadius: 12, width: "100%"
  },
  cardMode: { height: "auto", width: "100%", borderRadius: 12, backgroundColor: "#ffffffa1", paddingHorizontal: 10, paddingVertical: 15, display: "flex", justifyContent: "space-between", alignItems: "stretch", gap: 5 },

  cardTextMode: { height: 10, width: "100%", borderRadius: 12, backgroundColor: "#000" },

  textMode: { textAlign: "center", fontWeight: "medium", margin: 5, fontSize: 14 },

  linear: { height: 200, borderRadius: 6, padding: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 15 },

})