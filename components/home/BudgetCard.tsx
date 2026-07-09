import React from "react";
import { View, Text } from "react-native";
import { Wallet } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";

interface BudgetCardProps {
  budgetMensuel: number;
  totalDepense: number;
  reste: number;
}

export default function BudgetCard({ budgetMensuel, totalDepense, reste }: BudgetCardProps) {
  const { sectionColor } = useAppColors();
  const pourcentage = budgetMensuel > 0 ? (totalDepense / budgetMensuel) * 100 : 0;

  return (
    <View
      style={{
        borderRadius: 20,
        padding: 20,
        backgroundColor: sectionColor,
        gap: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <View style={[styles.bloomLayer, { height: 200, width: 200, top: -70, right: -60, opacity: 0.06 }]} />
      <View style={[styles.bloomLayer, { height: 140, width: 140, top: -40, right: -30, opacity: 0.1 }]} />
      <View style={[styles.bloomLayer, { height: 80, width: 80, top: -10, right: 0, opacity: 0.15 }]} />

      <View style={[styles.bloomLayer, { height: 120, width: 120, bottom: -40, left: -30, opacity: 0.08 }]} />


      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Wallet color="rgba(255,255,255,0.9)" size={16} />
        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "500" }}>
          Budget mensuel
        </Text>
      </View>
      <Text style={{ fontSize: 30, fontWeight: "800", color: "white" }}>
        {budgetMensuel.toLocaleString()} Ar
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
        <View>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>Dépensé</Text>
          <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
            {totalDepense.toLocaleString()} Ar
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>Restant</Text>
          <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
            {reste.toLocaleString()} Ar
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 14 }}>
        <View
          style={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.25)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.min(pourcentage, 100)}%`,
              height: "100%",
              borderRadius: 4,
              backgroundColor: pourcentage > 100 ? "#fca5a5" : pourcentage > 50 ? "#fde68a" : "#bbf7d0",
            }}
          />
        </View>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 4 }}>
          {pourcentage.toFixed(0)}% du budget utilisé
        </Text>
      </View>
    </View>
  );
}