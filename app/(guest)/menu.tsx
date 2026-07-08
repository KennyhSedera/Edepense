import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native'
import React, { } from 'react'
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/contexts/themeContext';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles as style } from "@/styles/styles";
import { useAppColors } from '@/hooks/useAppColors';
import { useHours } from '@/hooks/useHour';
import { ChevronRightIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import Toggle from '@/components/ui/Toggle';
import { MainHeader } from '@/components/header/header-main';
import { HeaderWithSearch } from './_layout';
import { useAuth } from '@/contexts/AuthContext';

export default function Menu() {
  const { colors, dark } = useTheme();
  const { setThemeMode } = useAppTheme();
  const { textColor, backgroundColor, border, cardBg, isDark, sectionColor } = useAppColors(); const {
    hour,
    enabled,
    disableNotifications,
    enableNotifications,
    handleHourChange
  } = useHours();

  const { user, logout } = useAuth();

  const handleChangeTheme = (theme: boolean) => {
    setThemeMode(theme ? "dark" : "light");
  };

  const handleToggle = async (value: boolean) => {
    value ? await enableNotifications() : await disableNotifications();
  }

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Menu" />}
    >
      <Pressable
        onPress={() => router.push("/profile")}
        style={[
          style.card,
          style.infoGridFull,
          style.rowSpacing,
          { backgroundColor: cardBg, borderColor: border }
        ]}
      >
        <View style={style.chipsWrap}>
          <Image
            source={user?.avatar ? { uri: user?.avatar } : require("@/assets/images/avatar.png")}
            style={[style.avatar, { borderColor: border }]}
          />
          <View>
            <Text style={[style.title, { color: textColor }]}>{user?.name}</Text>
            <Text style={[style.category, { color: textColor, fontSize: 14 }]}>{user?.email}</Text>
          </View>
        </View>
        <ChevronRightIcon size={30} color={textColor} />
      </Pressable>

      <View style={{ padding: 10, borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1, marginBottom: 10 }}>
        <View style={[style.rowSpacing, enabled && { marginBottom: 15 }]}>
          <Text style={[style.label, { color: textColor, marginLeft: 5, fontSize: 16, marginBottom: 0 }]}>Rappel quotidien</Text>
          <Toggle value={enabled} onChange={handleToggle} />
        </View>

        {enabled && (
          <View style={[style.chipsWrap]}>
            {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => handleHourChange(h)}
                style={{
                  width: "18%",
                  padding: 8,
                  alignItems: "center",
                  borderRadius: 8,
                  backgroundColor: hour === h ? sectionColor : backgroundColor,
                }}
              >
                <Text style={{ color: hour === h ? '#fff' : textColor }}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={[style.grid, style.card, style.infoGridFull, { backgroundColor: cardBg, paddingHorizontal: 8, paddingVertical: 12, borderRadius: 10, borderColor: border }]}>
        <Text style={[style.label, { color: textColor, marginLeft: 5, fontSize: 16 }]}>Thème de l'application</Text>
        <View style={[style.grid, { width: "100%", gap: 1 }]}>
          <Pressable onPress={() => handleChangeTheme(false)} style={{ width: "49.5%" }}>
            <View style={[style.cardMode, { borderWidth: !dark ? 3 : 0, borderColor: isDark ? border : colors.primary }]}>
              <LinearGradient colors={[Colors["light"].from, Colors["light"].to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[style.linearMode]}>
                <View style={[style.cardModeContent]}>
                  <View style={[style.cardTextMode, { width: "45%" }]} />
                  <View style={[style.cardTextMode]} />
                </View>
                <View style={[style.cardModeContent]}>
                  <View style={[style.cardTextMode, { width: "45%" }]} />
                  <View style={[style.cardTextMode]} />
                </View>
              </LinearGradient>
            </View>
            <Text style={[style.textMode, { color: isDark ? textColor : colors.primary }]}>Mode Claire</Text>
          </Pressable>
          <Pressable onPress={() => handleChangeTheme(true)} style={{ width: "49.5%" }}>
            <View style={[style.cardMode, , { borderColor: !isDark ? border : colors.primary, borderWidth: dark ? 3 : 0, }]}>
              <LinearGradient colors={[Colors["dark"].from, Colors["dark"].to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[style.linearMode]}>
                <View style={[style.cardModeContent, { backgroundColor: "#000000" }]}>
                  <View style={[style.cardTextMode, { width: "30%", backgroundColor: "#fff" }]} />
                  <View style={[style.cardTextMode, { width: "100%", backgroundColor: "#fff" }]} />
                </View>
                <View style={[style.cardModeContent, { backgroundColor: "#000000" }]}>
                  <View style={[style.cardTextMode, { width: "30%", backgroundColor: "#fff" }]} />
                  <View style={[style.cardTextMode, { width: "100%", backgroundColor: "#fff" }]} />
                </View>
              </LinearGradient>
            </View>
            <Text style={[style.textMode, { color: !isDark ? textColor : colors.primary }]}>Mode Sombre</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={logout} style={[style.button, { backgroundColor: sectionColor, borderColor: border }]}>
        <Text style={[style.buttonText]}>Se deconnecter</Text>
      </Pressable>

    </MainHeader>
  )
}
