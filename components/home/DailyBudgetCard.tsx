import React from "react";
import { View, Text } from "react-native";
import { CheckCircle2, AlertTriangle } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";

interface DailyBudgetCardProps {
  budgetJournalier: number;
}

export default function DailyBudgetCard({ budgetJournalier }: DailyBudgetCardProps) {
  const { cardBg, border, labelColor, textColor } = useAppColors();
  const estOk = budgetJournalier > 0;

  return (
    <View
      style={[
        styles.card, styles.infoGridFull,
        {
          backgroundColor: cardBg,
          borderColor: border,
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
        },
      ]}
    >
      <View>
        <Text style={{ color: labelColor, fontSize: 12 }}>Budget journalier</Text>
        <Text style={{ color: textColor, fontSize: 20, fontWeight: "700" }}>
          {budgetJournalier.toLocaleString()} Ar
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: estOk ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
        }}
      >
        {estOk ? (
          <CheckCircle2 color="#22c55e" size={14} />
        ) : (
          <AlertTriangle color="#ef4444" size={14} />
        )}
        <Text style={{ fontSize: 12, fontWeight: "600", color: estOk ? "#22c55e" : "#ef4444" }}>
          {estOk ? "OK aujourd'hui" : "Insuffisant"}
        </Text>
      </View>
    </View>
  );
}