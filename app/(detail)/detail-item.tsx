import { View, Text, ScrollView, Image } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppColors } from '@/hooks/useAppColors';
import { DepenseItem } from '@/types/db';
import { getItemById } from '@/controller/depense';
import { styles } from '@/styles/styles';
import { MiniCard } from './detail-shopping';
import { formatMoney } from '@/utils/numberFormat';
import { depenseCoverImage } from '@/constants/image';
import { getUnitLabel } from '@/constants/type';
import RenderImage from '@/components/ui/render-image';

export default function DetailItem() {
  const { textColor, backgroundColor, border, labelColor, dangerColor } = useAppColors();
  const { id }: { id: string } = useLocalSearchParams();
  const [data, setData] = useState<DepenseItem | null>(null);
  const [showImage, setShowImage] = useState(false);

  async function loadData(id: string) {
    const data = await getItemById(id);
    setData(data[0]);
  }

  useFocusEffect(
    useCallback(() => {
      loadData(id);
    }, [id],)
  )

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>

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
          value={`${formatMoney(data?.unit_price as number) ?? ""} `}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />

        <MiniCard
          label="Prix total"
          value={`${formatMoney(data?.total_price as number) ?? ""} `}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />
      </View>
    </ScrollView>
  )
}