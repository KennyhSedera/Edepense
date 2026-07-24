import React from "react";
import { View, Text } from "react-native";
import { Budget } from "@/types/db";
import { useAppColors } from "@/hooks/useAppColors";
import BudgetCategorieCard from "./BudgetCategorieCard";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";

export default function BudgetsCategorieSection({ budgets, user }: { budgets: Budget[], user: any }) {
  const { textColor, labelColor, sectionColor, cardBg, border } = useAppColors();

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: textColor, fontSize: 16, fontWeight: "700" }}>Budgets par catégorie</Text>
        <TouchableOpacity
          onPress={() => router.push("/budget-form")}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Plus size={16} color={sectionColor} />
          <Text style={{ color: sectionColor, fontSize: 13, fontWeight: "600" }}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1, borderRadius: 14, padding: 16, alignItems: "center" }}>
          <Text style={{ color: labelColor, fontSize: 13, textAlign: "center" }}>
            Aucun budget par catégorie pour l'instant.{"\n"}Créez-en un pour suivre vos dépenses par poste (Alimentaire, Transport...).
          </Text>
        </View>
      ) : (
        budgets.map((b) => <BudgetCategorieCard key={b.id} budget={b} user={user} />)
      )}
    </View>
  );
}