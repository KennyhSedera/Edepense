import React from "react";
import { View, Text, Pressable } from "react-native";
import { Target, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";

interface ObjectifEpargneProps {
  nomObjectif: string;
  montantCible: number;
  montantActuel: number;
  goalId: string;
}

export default function ObjectifEpargne({
  nomObjectif,
  montantCible,
  montantActuel,
  goalId,
}: ObjectifEpargneProps) {
  const { cardBg, border, textColor, labelColor, sectionColor, gradient } = useAppColors();

  const pourcentage = montantCible > 0 ? Math.min((montantActuel / montantCible) * 100, 100) : 0;
  const restant = Math.max(montantCible - montantActuel, 0);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/detail-budget", params: { id: goalId } })}
      style={[styles.card, styles.infoGridFull, { backgroundColor: `${gradient.to}4f`, borderColor: gradient.to, borderRadius: 16, padding: 16, gap: 12 }]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Target color={sectionColor} size={18} />
          <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>{nomObjectif}</Text>
        </View>
        <ChevronRight color={labelColor} size={18} />
      </View>

      <View>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: "#ffffff4f", overflow: "hidden" }}>
          <View
            style={{
              width: `${pourcentage}%`,
              height: "100%",
              borderRadius: 5,
              backgroundColor: gradient.to,
            }}
          />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ color: textColor, fontSize: 12 }}>
            {montantActuel.toLocaleString()} / {montantCible.toLocaleString()} Ar
          </Text>
          <Text style={{ color: sectionColor, fontSize: 12, fontWeight: "700" }}>
            {pourcentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {restant > 0 && (
        <Text style={{ color: textColor, fontSize: 12 }}>
          Encore {restant.toLocaleString()} Ar pour atteindre ton objectif
        </Text>
      )}
    </Pressable>
  );
}