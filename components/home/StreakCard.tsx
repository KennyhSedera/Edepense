import React from "react";
import { View, Text } from "react-native";
import { Flame } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";

interface StreakCardProps {
  joursDansLeBudget: number;
}

export default function StreakCard({ joursDansLeBudget }: StreakCardProps) {
  const { cardBg, border, textColor, labelColor } = useAppColors();

  return (
    <View
      style={[
        styles.card, styles.infoGridFull,
        {
          backgroundColor: cardBg,
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
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: "rgba(249,115,22,0.15)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Flame color="#f97316" size={22} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: textColor, fontSize: 16, fontWeight: "700" }}>
          {joursDansLeBudget} jour{joursDansLeBudget > 1 ? "s" : ""} d'affilée
        </Text>
        <Text style={{ color: labelColor, fontSize: 12 }}>dans ton budget journalier 🔥</Text>
      </View>
    </View>
  );
}