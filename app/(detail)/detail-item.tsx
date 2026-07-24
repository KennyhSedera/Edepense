import { View, Text, ScrollView, Image } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppColors } from '@/hooks/useAppColors';
import { DepenseItem } from '@/types/db';
import { getItemById } from '@/controller/depense.controller';
import { styles } from '@/styles/styles';
import { MiniCard } from './detail-shopping';
import { formatMoney } from '@/utils/number.util';
import { depenseCoverImage } from '@/constants/image';
import { getUnitLabel } from '@/constants/type';
import RenderImage from '@/components/modal/render-image';
import { MainHeader } from '@/components/header/header-main';
import { DetailHeader } from './_layout';
import { useAuth } from '@/contexts/AuthContext';

export default function DetailItem() {
  const { textColor, backgroundColor, border, labelColor, dangerColor } = useAppColors();
  const { id }: { id: string } = useLocalSearchParams();
  const [data, setData] = useState<DepenseItem | null>(null);
  const [showImage, setShowImage] = useState(false);

  const { user } = useAuth();

  async function loadData(id: string) {
    const data = await getItemById(id);
    setData(data || null);
  }

  useFocusEffect(
    useCallback(() => {
      loadData(id);
    }, [id],)
  )


  return (
    <MainHeader
      height={100}
      header={() => <DetailHeader title="Détail du produit" />}
    >
      <RenderImage
        value={data?.image ? { uri: data.image } : depenseCoverImage("Alimentation")}
        onChange={setShowImage}
        visible={showImage}
      />

      <Image
        source={data?.image ? { uri: data.image } : depenseCoverImage("Alimentation")}
        resizeMode='cover'
        style={[{ borderRadius: 9, width: "100%", height: 250, marginBottom: 15 }]}
      />

      {/* INFOS */}
      <View style={styles.infoGrid}>
        <MiniCard
          label="Nom du provision"
          value={data?.name as string || ""}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridFull}
        />

        <MiniCard
          label="Quantité"
          value={`${data?.quantity as number ?? ""}`}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />

        <MiniCard
          label="Unité"
          value={`${getUnitLabel(data?.unit as string)}` || ""}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />

        <MiniCard
          label="Prix unitaire"
          value={`${formatMoney(data?.unit_price as number) ?? "", user?.devise || "MGA"} `}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />

        <MiniCard
          label="Prix total"
          value={`${formatMoney(data?.total_price as number) ?? "", user?.devise || "MGA"} `}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />
      </View>
    </MainHeader>
  )
}