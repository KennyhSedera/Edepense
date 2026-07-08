import React from "react";
import { View, Text } from "react-native";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";

interface IntelligenceCardProps {
  economieConseil: number;
  predictionFinMois: number;
  budgetMensuel: number;
}

export default function IntelligenceCard({
  economieConseil,
  predictionFinMois,
  budgetMensuel,
}: IntelligenceCardProps) {
  const { cardBg, border, textColor, labelColor, sectionColor } = useAppColors();
  const risqueDepassement = predictionFinMois > budgetMensuel;

  return (
    <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, borderRadius: 16, padding: 16, gap: 14 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Sparkles color={sectionColor} size={18} />
        <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>Intelligence</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ color: labelColor, fontSize: 12 }}>Économie conseillée</Text>
          <Text style={{ color: textColor, fontSize: 16, fontWeight: "700" }}>
            {economieConseil.toLocaleString()} Ar
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: labelColor, fontSize: 12 }}>Prévision fin de mois</Text>
          <Text style={{ color: textColor, fontSize: 16, fontWeight: "700" }}>
            {predictionFinMois.toLocaleString()} Ar
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 12,
          backgroundColor: risqueDepassement ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
        }}
      >
        {risqueDepassement ? (
          <TrendingUp color="#ef4444" size={18} />
        ) : (
          <TrendingDown color="#22c55e" size={18} />
        )}
        <Text style={{ fontSize: 13, fontWeight: "600", color: risqueDepassement ? "#ef4444" : "#22c55e" }}>
          {risqueDepassement ? "Risque de dépassement" : "Budget maîtrisé"}
        </Text>
      </View>
    </View>
  );
}