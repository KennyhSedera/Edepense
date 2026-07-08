import React from "react";
import { View, Text } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense } from "@/types/db";
import { styles } from "@/styles/styles";

interface CategoryBreakdownProps {
  depenses: Depense[];
}

const COULEURS_CATEGORIES: Record<string, string> = {
  Alimentation: "#22c55e",
  Légumes: "#22c55e",
  Transport: "#3b82f6",
  Santé: "#ef4444",
  Loisirs: "#a855f7",
  Viande: "#a855f7",
  Logement: "#f59e0b",
  Téléphonie: "#06b6d4",
  Vêtements: "#00771e",
  Autre: "#94a3b8",
};

export default function CategoryBreakdown({ depenses }: CategoryBreakdownProps) {
  const { cardBg, border, textColor, labelColor } = useAppColors();

  const totaux = depenses.reduce((acc: Record<string, number>, dep) => {
    acc[dep?.categorie as string] = (acc[dep?.categorie as string] || 0) + dep.montant;
    return acc;
  }, {});

  const totalGlobal = Object.values(totaux).reduce((a, b) => a + b, 0);
  const entries = Object.entries(totaux).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  return (
    <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, borderRadius: 16, padding: 16, gap: 12 }]}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>Par catégorie</Text>

      {/* Barre empilée */}
      <View style={{ flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden" }}>
        {entries.map(([cat, montant]) => (
          <View
            key={cat}
            style={{
              width: `${(montant / totalGlobal) * 100}%`,
              backgroundColor: COULEURS_CATEGORIES[cat] || "#94a3b8",
            }}
          />
        ))}
      </View>

      <View style={{ gap: 8 }}>
        {entries.map(([cat, montant]) => (
          <View key={cat} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COULEURS_CATEGORIES[cat] || "#94a3b8",
              }}
            />
            <Text style={{ color: textColor, fontSize: 13, flex: 1 }}>{cat}</Text>
            <Text style={{ color: labelColor, fontSize: 12 }}>
              {((montant / totalGlobal) * 100).toFixed(0)}%
            </Text>
            <Text style={{ color: textColor, fontSize: 13, fontWeight: "700", minWidth: 70, textAlign: "right" }}>
              {montant.toLocaleString()} Ar
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}