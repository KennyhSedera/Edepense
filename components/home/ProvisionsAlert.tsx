import React from "react";
import { View, Text, Pressable } from "react-native";
import { PackageOpen, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";
import { Provision } from "@/types/db";
import { styles } from "@/styles/styles";

interface ProvisionsAlertProps {
  provisions: Provision[];
  seuilAlerte?: number; // pourcentage restant en dessous duquel on alerte
}

export default function ProvisionsAlert({ provisions, seuilAlerte = 20 }: ProvisionsAlertProps) {
  const { cardBg, border, textColor, labelColor } = useAppColors();

  const provisionsBasses = provisions.filter((p) => {
    const pourcentageRestant = (p.quantite_restante / p.quantite_initiale) * 100;
    return pourcentageRestant <= seuilAlerte && pourcentageRestant > 0;
  });

  if (provisionsBasses.length === 0) return null;

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/provision")}
      style={[
        styles.card, styles.infoGridFull,
        {
          backgroundColor: "rgba(251,191,36,0.1)",
          borderColor: "rgba(251,191,36,0.3)",
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
          backgroundColor: "rgba(251,191,36,0.2)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PackageOpen color="#f59e0b" size={20} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: textColor, fontSize: 13, fontWeight: "700" }}>
          {provisionsBasses.length} provision{provisionsBasses.length > 1 ? "s" : ""} en rupture bientôt
        </Text>
        <Text style={{ color: labelColor, fontSize: 12 }} numberOfLines={1}>
          {provisionsBasses.map((p) => p.nom).join(", ")}
        </Text>
      </View>

      <ChevronRight color={labelColor} size={18} />
    </Pressable>
  );
}