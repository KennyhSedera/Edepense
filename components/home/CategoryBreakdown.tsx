import React from "react";
import { View, Text } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense } from "@/types/db";
import { styles } from "@/styles/styles";
import { formatMoney } from "@/utils/number.util";

interface CategoryBreakdownProps {
  depenses: Depense[];
  user: any;
}

const COULEURS_CATEGORIES: Record<string, string> = {
  Fruits: "#f97316",
  Légumes: "#22c55e",
  Viandes: "#dc2626",
  "Poissons et Fruits de mer": "#0ea5e9",
  "Produits laitiers": "#facc15",
  "Épicerie sèche": "#eab308",
  Boissons: "#3b82f6",
  "Snacks et Confiseries": "#ec4899",
  "Produits ménagers": "#64748b",
  "Hygiène et Beauté": "#14b8a6",
  "Aliments pour animaux": "#8b5cf6",
  "Vêtements et Accessoires": "#7c3aed",
  "Jouets et Jeux": "#f43f5e",
  "Éducation et Loisirs": "#06b6d4",
  Autres: "#94a3b8",
};

function normaliserCategorie(categorie?: string): string {
  if (!categorie) return "Autres";

  const c = categorie
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[&/+]/g, " et ")
    .replace(/\s+/g, " ");

  // Cas composés
  if (c.includes("fruit") && c.includes("legume")) {
    return "Fruits et Légumes";
  }

  if (c.includes("poisson") && c.includes("fruit de mer")) {
    return "Poissons et Fruits de mer";
  }

  // Cas simples
  if (c.includes("fruit")) return "Fruits";
  if (c.includes("legume")) return "Légumes";
  if (c.includes("viande")) return "Viandes";
  if (c.includes("epicerie")) return "Épicerie sèche";
  if (c.includes("boisson")) return "Boissons";
  if (c.includes("lait")) return "Produits laitiers";
  if (c.includes("menager")) return "Produits ménagers";
  if (c.includes("hygiene") || c.includes("beaute"))
    return "Hygiène et Beauté";
  if (c.includes("vetement") || c.includes("accessoire"))
    return "Vêtements et Accessoires";
  if (c.includes("jouet") || c.includes("jeu"))
    return "Jouets et Jeux";
  if (c.includes("loisir") || c.includes("education"))
    return "Éducation et Loisirs";
  if (c.includes("animal")) return "Aliments pour animaux";

  return "Autres";
}

export default function CategoryBreakdown({
  depenses,
  user
}: CategoryBreakdownProps) {
  const { cardBg, border, textColor, labelColor } = useAppColors();

  const totaux = depenses.reduce((acc: Record<string, number>, dep) => {
    const categorie = normaliserCategorie(dep.categorie);

    acc[categorie] = (acc[categorie] || 0) + dep.montant;

    return acc;
  }, {});

  const totalGlobal = Object.values(totaux).reduce((a, b) => a + b, 0);

  const entries = Object.entries(totaux).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  return (
    <View
      style={[
        styles.card,
        styles.infoGridFull,
        {
          backgroundColor: cardBg,
          borderColor: border,
          borderRadius: 16,
          padding: 16,
          gap: 12,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "700",
          color: textColor,
        }}
      >
        Par catégorie
      </Text>

      <View
        style={{
          flexDirection: "row",
          height: 10,
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        {entries.map(([cat, montant]) => (
          <View
            key={cat}
            style={{
              width: `${(montant / totalGlobal) * 100}%`,
              backgroundColor:
                COULEURS_CATEGORIES[cat] ??
                COULEURS_CATEGORIES.Autres,
            }}
          />
        ))}
      </View>

      <View style={{ gap: 8 }}>
        {entries.map(([cat, montant]) => (
          <View
            key={cat}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  COULEURS_CATEGORIES[cat] ??
                  COULEURS_CATEGORIES.Autres,
              }}
            />

            <Text
              style={{
                color: textColor,
                fontSize: 13,
                flex: 1,
              }}
            >
              {cat}
            </Text>

            <Text
              style={{
                color: labelColor,
                fontSize: 12,
              }}
            >
              {((montant / totalGlobal) * 100).toFixed(0)}%
            </Text>

            <Text
              style={{
                color: textColor,
                fontSize: 13,
                fontWeight: "700",
                minWidth: 70,
                textAlign: "right",
              }}
            >
              {formatMoney(montant, user?.devise || "MGA")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}