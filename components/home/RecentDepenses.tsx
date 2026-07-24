import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronRight, Receipt } from "lucide-react-native";
import { router } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense } from "@/types/db";
import { styles } from "@/styles/styles";
import { formatCompactNumber } from "@/utils/number.util";

interface RecentDepensesProps {
  depenses: Depense[];
  user: any;
}

export default function RecentDepenses({ depenses, user }: RecentDepensesProps) {
  const { cardBg, border, textColor, labelColor, sectionColor } = useAppColors();
  const recentes = depenses.slice(0, 4);

  if (recentes.length === 0) return null;

  return (
    <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, borderRadius: 16, padding: 16, gap: 12 }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: textColor }}>Dépenses récentes</Text>
        <Pressable onPress={() => router.push("/(tabs)/shopping")} style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text style={{ color: sectionColor, fontSize: 12, fontWeight: "600" }}>Tout voir</Text>
          <ChevronRight color={sectionColor} size={14} />
        </Pressable>
      </View>

      <View style={{ gap: 8 }}>
        {recentes.map((dep) => (
          <Pressable
            key={dep.id}
            onPress={() => router.push({ pathname: "/detail-shopping", params: { id: dep.id } })}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 8,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: `${sectionColor}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Receipt color={sectionColor} size={16} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: textColor, fontSize: 13, fontWeight: "600" }} numberOfLines={1}>
                {dep.description || dep.categorie}
              </Text>
              <Text style={{ color: labelColor, fontSize: 11 }}>{dep.categorie}</Text>
            </View>
            <Text style={{ color: textColor, fontSize: 13, fontWeight: "700" }}>
              {formatCompactNumber(dep.montant, user?.devise || "MGA")}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}