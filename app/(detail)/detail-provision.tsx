import { View, Text, ScrollView, ToastAndroid, Pressable, Image } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useLocalSearchParams, useSearchParams } from 'expo-router/build/hooks'
import { styles } from '@/styles/styles';
import { deleteProvision, getProvisionById } from '@/db/provision';
import { router, useFocusEffect } from 'expo-router';
import DeleteModal from '@/components/ui/DeleteModal';
import MenuButton, { MenuItem } from '@/components/ui/MenuButton';
import { LucideEdit, Trash2 } from 'lucide-react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { MiniCard } from './detail-shopping';
import { Provision } from '@/types/db';
import { formatMoney } from '@/utils/numberFormat';
import { formatDateLong } from '@/utils/dateFormat';
import { depenseCoverImage } from '@/constants/image';
import { getUnitLabel } from '@/constants/type';

export default function DetailProvision() {
  const { textColor, backgroundColor, border, labelColor, dangerColor } = useAppColors();
  const { id }: { id: string } = useLocalSearchParams();
  const [data, setData] = useState<Provision | null>(null)
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });

  async function loadData(id: string) {
    const data = await getProvisionById(id);
    setData(data);

  }

  useFocusEffect(
    useCallback(() => {
      loadData(id);
    }, [id],)
  )

  const handleDelete = async (action: string, id: string) => {
    if (action === "delete") {
      const res = await deleteProvision(id);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData(id);
        router.back();
        setConfirmDelete({ show: false, id: "", message: "" });
      }
    }

    setConfirmDelete({ show: false, id: "", message: "" });
  }

  return (
    <View style={{ flex: 1 }}>
      <DeleteModal onChange={handleDelete} visible={confirmDelete.show} message={confirmDelete.message} id={data?.id} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <MenuButton>
          <MenuItem
            onPress={() => router.push({ pathname: '/provision-form', params: { id: data?.id } })}
          >
            <LucideEdit size={18} color={textColor} />
            <Text style={{ color: textColor, fontSize: 15 }}>Modifier</Text>
          </MenuItem>
          <View style={{ height: 1, backgroundColor: border }} />
          <MenuItem
            onPress={() => setConfirmDelete({ show: true, id: data?.id || "", message: `Voulez-vous vraiment supprimer la provision "${data?.nom}" ?` })}
          >
            <Trash2 size={18} color={dangerColor} />
            <Text style={{ color: dangerColor, fontSize: 15 }}>Supprimer</Text>
          </MenuItem>
        </MenuButton>
        <Image
          source={data?.image ? { uri: data.image } : depenseCoverImage("Alimentation")}
          resizeMode='cover'
          style={[{ borderRadius: 9, width: "100%", height: 250, marginBottom: 15 }]}
        />

        {/* INFOS */}
        <View style={styles.infoGrid}>
          <MiniCard
            label="Nom du provision"
            value={data?.nom as string || ""}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridFull}
          />
          <MiniCard
            label="Catégorie"
            value={data?.categorie as string || ""}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridFull}
          />
          <MiniCard
            label="Quantité initiale"
            value={`${data?.quantite_initiale as number ?? ""} ${getUnitLabel(data?.unite as string)}`}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridHalf}
          />
          <MiniCard
            label="Quantité restante"
            value={`${data?.quantite_restante as number ?? ""} ${getUnitLabel(data?.unite as string)}`}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridHalf}
          />
          <MiniCard
            label="Prix unitaire"
            value={`${formatMoney(data?.prix_unitaire as number) ?? ""} `}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridHalf}
          />
          <MiniCard
            label="Prix total"
            value={`${formatMoney(data?.prix_total as number) ?? ""} `}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridHalf}
          />
          <MiniCard
            label="Date d'achat"
            value={formatDateLong(data?.date_achat as string || "")}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridFull}
          />
        </View>

      </ScrollView>
    </View>
  )
}