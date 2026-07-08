import React from "react";
import { View, Text } from "react-native";
import { TrendingDown, TrendingUp, Minus } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense } from "@/types/db";
import { styles } from "@/styles/styles";

interface ComparaisonMoisPrecedentProps {
  depensesMoisActuel: Depense[];
  depensesMoisPrecedent: Depense[];
  jourDuMois: number; // pour comparer "à date égale"
}

export default function ComparaisonMoisPrecedent({
  depensesMoisActuel,
  depensesMoisPrecedent,
  jourDuMois,
}: ComparaisonMoisPrecedentProps) {
  const { cardBg, border, textColor, labelColor } = useAppColors();

  // Ne compare que les dépenses du mois précédent jusqu'au même jour du mois
  const totalActuel = depensesMoisActuel.reduce((sum, d) => sum + d.montant, 0);
  const totalPrecedentADate = depensesMoisPrecedent
    .filter((d) => new Date(d.date).getDate() <= jourDuMois)
    .reduce((sum, d) => sum + d.montant, 0);

  if (totalPrecedentADate === 0) return null; // pas de données pour comparer

  const difference = totalActuel - totalPrecedentADate;
  const pourcentage = Math.abs((difference / totalPrecedentADate) * 100);
  const estMoinsDepense = difference < 0;
  const estEgal = Math.abs(pourcentage) < 1;

  const couleur = estEgal ? labelColor : estMoinsDepense ? "#22c55e" : "#ef4444";
  const Icone = estEgal ? Minus : estMoinsDepense ? TrendingDown : TrendingUp;

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
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${couleur}20`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icone color={couleur} size={20} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: textColor, fontSize: 13, fontWeight: "700" }}>
          {estEgal
            ? "Même rythme que le mois dernier"
            : `${pourcentage.toFixed(0)}% ${estMoinsDepense ? "de moins" : "de plus"} qu'à pareille date`}
        </Text>
        <Text style={{ color: labelColor, fontSize: 12 }}>
          {totalPrecedentADate.toLocaleString()} Ar le mois dernier vs {totalActuel.toLocaleString()} Ar ce mois-ci
        </Text>
      </View>
    </View>
  );
}