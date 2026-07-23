import { View, Text } from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { getMouvementsByProvision } from "@/controller/provision.mouvement.controller";
import { getUnitLabel } from "@/constants/type";
import { useAppColors } from "@/hooks/useAppColors";
import { MainHeader } from "@/components/header/header-main";
import { DetailHeader } from "@/app/(detail)/_layout";
import EmptyData from "@/components/ui/empty-data";
import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react-native";
import { ProvisionMouvement } from "@/types/db";
import { formatDateLong } from './../../utils/date.util';

export default function HistoriqueProvision() {
  const { id }: { id: string } = useLocalSearchParams();
  const { textColor, labelColor, cardBg, border, successColor, dangerColor } = useAppColors();
  const [mouvements, setMouvements] = useState<ProvisionMouvement[]>([]);

  useFocusEffect(
    useCallback(() => {
      getMouvementsByProvision(id).then(setMouvements);
    }, [id])
  );

  return (
    <MainHeader height={100} header={() => <DetailHeader title="Historique des mouvements" />}>
      {mouvements.length === 0 && <EmptyData message="Aucun mouvement enregistré" icon={<History size={50} color={labelColor} />} />}

      {mouvements.map(m => {
        const isEntree = m.type === "entree";
        const couleur = isEntree ? successColor : dangerColor;
        const Icone = isEntree ? ArrowUpCircle : ArrowDownCircle;

        return (
          <View
            key={m.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 12,
              borderRadius: 12,
              marginBottom: 8,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: border,
            }}
          >
            <Icone size={22} color={couleur} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: textColor, fontWeight: "600" }}>
                {isEntree ? "+" : "-"}{m.quantite} {getUnitLabel(m.unite)}
              </Text>
              <Text style={{ color: labelColor, fontSize: 12 }}>{m.note}</Text>
            </View>
            <Text style={{ color: labelColor, fontSize: 11 }}>
              {formatDateLong(m.date)}
            </Text>
          </View>
        );
      })}
    </MainHeader>
  );
}