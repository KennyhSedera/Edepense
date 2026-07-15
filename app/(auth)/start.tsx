import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ArrowRight, } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { useRouter } from "expo-router";
import HeaderDripAnimated from "@/components/header/header-drip-animated";
import AnimatedHeader from "@/components/header/animate-header";
import { FEATURESWELCOME } from "@/constants/type";
import { useAuth } from "@/contexts/AuthContext";
import { getAllUser } from "@/controller/user.controller";

export default function WelcomeScreen() {
  const { textColor, sectionColor } = useAppColors();
  const router = useRouter();
  const { user } = useAuth();
  let existingUser = false;

  async function getUsers() {
    const user = await getAllUser();
    if (user.length > 0) {
      existingUser = true;
    }
  }

  useEffect(() => {
    getUsers();
  }, [])

  function handleBegin() {
    if (user) {
      router.replace("/(tabs)")
      return;
    }
    if (!existingUser) {
      router.replace("/(auth)/register");
      return;
    }
    router.replace("/(auth)/login");
  }

  return (
    <AnimatedHeader
      maxHeight={280}
      minHeight={90}
      header={(scrollY) => (
        <HeaderDripAnimated
          scrollY={scrollY}
          maxHeight={220}
          minHeight={90}
          title="Bienvenue"
          subtitle="L'application de gestion des finances numériques. Créez votre compte gratuitement."
        />
      )}
    >
      <View style={s.body}>
        <Text style={[s.sectionEyebrow, { color: textColor }]}>FONCTIONNALITÉS</Text>
        <Text style={[s.sectionTitle, { color: textColor }]}>Tout, déjà réuni dans une appli</Text>
        <Text style={[s.sectionSubtitle, { color: textColor }]}>
          Scan, budget, épargne et statistiques pour piloter vos finances
          sans effort.
        </Text>

        <View style={s.grid}>
          {FEATURESWELCOME.map((f, i) => {
            const Icon = f.icon;
            return (
              <Animated.View
                key={f.title}
                entering={FadeInUp.delay(i * 70).duration(450).springify()}
                style={[s.card, { backgroundColor: f.bg }]}
              >
                <View style={[s.cardIcon, { backgroundColor: f.color }]}>
                  <Icon size={18} color="#fff" strokeWidth={2.2} />
                </View>
                <Text style={[s.cardTitle, { color: f.color }]}>{f.title}</Text>
                <Text style={s.cardDesc}>{f.desc}</Text>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View
          entering={FadeInUp.delay(FEATURESWELCOME.length * 70 + 150).duration(500)}
          style={s.ctaWrapper}
        >
          <Pressable
            onPress={handleBegin}
            style={({ pressed }) => [
              s.ctaButton,
              { backgroundColor: sectionColor },
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
          >
            <Text style={s.ctaText}>Commencer</Text>
            <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
          </Pressable>
          <Text style={[s.ctaFooter, { color: textColor }]}>
            Gratuit • Sans engagement • En-ligne ou hors-ligne compatible
          </Text>
        </Animated.View>
      </View>
    </AnimatedHeader>
  );
}

const s = StyleSheet.create({
  body: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  sectionEyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1, opacity: 0.9, marginBottom: 6 },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  sectionSubtitle: { fontSize: 13, marginTop: 6, lineHeight: 19, opacity: 0.75, marginBottom: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  card: { width: "47.5%", borderRadius: 18, padding: 14, marginBottom: 4 },
  cardIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  cardTitle: { fontSize: 13.5, fontWeight: "700", marginBottom: 4 },
  cardDesc: { fontSize: 11.5, lineHeight: 15.5, opacity: 0.65 },
  ctaWrapper: { alignItems: "center", marginTop: 28 },
  ctaButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, borderRadius: 18, width: "100%", gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  ctaText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  ctaFooter: { marginTop: 12, fontSize: 12, opacity: 0.6 },
});