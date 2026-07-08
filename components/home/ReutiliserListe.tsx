import React from "react";
import { View, Text, Pressable } from "react-native";
import { RotateCcw, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense } from "@/types/db";
import { styles } from "@/styles/styles";

interface ReutiliserListeProps {
  derniereListeCourses: Depense | null;
}

export default function ReutiliserListe({ derniereListeCourses }: ReutiliserListeProps) {
  const { gradient, border, textColor, labelColor, sectionColor } = useAppColors();

  if (!derniereListeCourses || derniereListeCourses.items?.length === 0) return null;

  const nombreArticles = derniereListeCourses.items?.length;
  const dateFormatee = new Date(derniereListeCourses.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  function reutiliserListe() {
    router.push({
      pathname: "/shopping-form",
      params: {
        id: derniereListeCourses?.id
      },
    });
  }

  return (
    <Pressable
      onPress={reutiliserListe}
      style={[
        styles.card, styles.infoGridFull,
        {
          backgroundColor: gradient.middle,
          borderColor: border,
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        },
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${sectionColor}20`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RotateCcw color={sectionColor} size={18} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: textColor, fontSize: 13, fontWeight: "700" }}>
          Réutiliser ta liste du {dateFormatee}
        </Text>
        <Text style={{ color: labelColor, fontSize: 12 }}>
          {nombreArticles} article{nombreArticles as number > 1 ? "s" : ""} • {derniereListeCourses.montant.toLocaleString()} Ar
        </Text>
      </View>

      <ChevronRight color={labelColor} size={18} />
    </Pressable>
  );
}