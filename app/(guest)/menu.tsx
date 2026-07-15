import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native'
import React, { } from 'react'
import { useAppTheme } from '@/contexts/themeContext';
import { useTheme } from '@react-navigation/native';
import { styles as style } from "@/styles/styles";
import { useAppColors } from '@/hooks/useAppColors';
import { BadgeDollarSignIcon, ChevronRightIcon, CogIcon, ImagesIcon, ListChecks, MessageCircle, Music4Icon, ShoppingCart, UserCircleIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { MainHeader } from '@/components/header/header-main';
import { HeaderWithSearch } from './_layout';
import { useAuth } from '@/contexts/AuthContext';
import CardMenu from '@/components/ui/card-menu';
import ModalConfirm from '@/components/modal/modal-confirm';
import { ThemeCard } from '@/components/ui/ThemeCard';

export default function Menu() {
  const { colors, dark } = useTheme();
  const { setThemeMode } = useAppTheme();
  const { textColor, border, cardBg, isDark, sectionColor } = useAppColors();
  const [visible, setVisible] = React.useState(false);

  const { user, logout } = useAuth();

  const handleChangeTheme = (theme: boolean) => {
    setThemeMode(theme ? "dark" : "light");
  };

  const handleLogout = (action: string) => {
    action === "confirm" ? logout() : setVisible(false);
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
            style={[style.avatar, { borderColor: sectionColor }]}
          />
          <View>
            <Text style={[style.title, { color: textColor }]}>{user?.name}</Text>
            <Text style={[style.category, { color: textColor, fontSize: 14 }]}>{user?.email}</Text>
          </View>
        </View>
        <ChevronRightIcon size={30} color={textColor} />
      </Pressable>

      <View style={[{ width: "100%", gap: 1, marginBottom: 10, backgroundColor: cardBg, padding: 10, borderRadius: 10 }]}>
        <Text style={[style.label, { color: textColor }]}>Thème de l'application</Text>
        <View style={[style.rowSpacing]}>
          <ThemeCard
            darkMode={false}
            selected={!dark}
            title="Mode Clair"
            onPress={() => handleChangeTheme(false)}
          />
          <ThemeCard
            darkMode
            selected={dark}
            title="Mode Sombre"
            onPress={() => handleChangeTheme(true)}
          />
        </View>
      </View>

      <View style={[style.infoGrid, { marginBottom: 0, paddingBottom: 0, gap: 0 }]}>
        <CardMenu title="Compte" Icon={UserCircleIcon} onPress={() => router.push("/profile")} color='#56c000' iconColor='#fff' />
        <CardMenu title="Budgets" Icon={BadgeDollarSignIcon} onPress={() => router.push("/budget")} color='#F59E0B' iconColor='#fff' />
        <CardMenu title="Courses à acheter" Icon={ShoppingCart} onPress={() => router.push("/course-screen")} color='#f502a4' iconColor='#fff' />
        <CardMenu title="Messages" Icon={MessageCircle} onPress={() => router.push("/type-whatsapp")} color='#14B8A6' iconColor='#fff' />
        <CardMenu title="Todo List" Icon={ListChecks} onPress={() => router.push("/todo-screen")} color='#f0d800' iconColor='#fff' />
        <CardMenu title="Paramètres" Icon={CogIcon} onPress={() => router.push("/setting")} color='#2528f0' iconColor='#fff' />
        <CardMenu title="Notes vocales" Icon={Music4Icon} onPress={() => router.push("/notes-vocales")} color='#8B5CF6' iconColor='#fff' />
        <CardMenu title="Photos" Icon={ImagesIcon} onPress={() => router.push("/image-enregistrer")} color='#e00013' iconColor='#fff' />
      </View>

      <Pressable onPress={() => setVisible(true)} style={[style.button, { backgroundColor: sectionColor, borderColor: border, marginBottom: 0 }]}>
        <Text style={[style.buttonText]}>Se deconnecter</Text>
      </Pressable>

      <ModalConfirm visible={visible} onChange={handleLogout} message="Voulez-vous vraiment vous déconnecter ?" title="Déconnexion ?" buttonText="Se déconnecter" />
    </MainHeader>
  )
}
