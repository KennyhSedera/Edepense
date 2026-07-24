import React from "react";
import { View, Text } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import { Budget } from "@/types/db";
import { CheckCircle2, AlertTriangle } from "lucide-react-native";
import { formatMoney } from "@/utils/number.util";

export default function BudgetCategorieCard({ budget, user }: { budget: Budget, user: any }) {
  const { cardBg, border, labelColor, textColor, sectionColor } = useAppColors();

  const budgetTotal = Number(budget.budgetTotal) || 0;
  const budgetRestant = Number(budget.budgetRestant) || 0;

  const pourcentage = budgetTotal > 0
    ? ((budgetTotal - budgetRestant) / budgetTotal) * 100
    : 0;
  const estOk = budgetRestant >= 0;

  const labelFrequence = {
    quotidien: "Quotidien",
    hebdomadaire: "Hebdomadaire",
    mensuel: "Mensuel",
  }[budget.frequence] ?? "Mensuel";

  return (
    <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, borderRadius: 14, padding: 14 }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: textColor, fontSize: 15, fontWeight: "700" }}>{budget.budgetName}</Text>
          <Text style={{ color: labelColor, fontSize: 11, marginTop: 2 }}>
            {(budget.categories ?? []).join(", ")} · {labelFrequence}
          </Text>
        </View>
        {estOk ? (
          <CheckCircle2 color="#22c55e" size={16} />
        ) : (
          <AlertTriangle color="#ef4444" size={16} />
        )}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <Text style={{ color: labelColor, fontSize: 12 }}>
          Restant : <Text style={{ color: estOk ? textColor : "#ef4444", fontWeight: "700" }}>
            {formatMoney(budgetRestant, user?.devise || "Ar")}
          </Text>
        </Text>
        <Text style={{ color: labelColor, fontSize: 12 }}>
          Total : {formatMoney(budgetTotal, user?.devise || "Ar")}
        </Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: `${border}`, overflow: "hidden" }}>
          <View
            style={{
              width: `${Math.min(Math.max(pourcentage, 0), 100)}%`,
              height: "100%",
              borderRadius: 3,
              backgroundColor: pourcentage > 100 ? "#fca5a5" : pourcentage > 75 ? "#fde68a" : sectionColor,
            }}
          />
        </View>
      </View>
    </View>
  );
}