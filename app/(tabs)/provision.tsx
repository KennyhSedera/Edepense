import { Image, Pressable, ScrollView, Text, ToastAndroid, View } from 'react-native'
import React, { useCallback, useState } from 'react';
import { Edit, LucideApple, LucideTrash2, Plus, Search, SearchSlash } from 'lucide-react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppColors } from '@/hooks/useAppColors';
import { styles } from '@/styles/styles';
import { Provision } from '@/types/db';
import { deleteProvision, getProvision } from '@/db/provision';
import { useBudgetStore } from '@/store/budgetStore';
import { formatDateLong } from '@/utils/dateFormat';
import { depenseCoverImage } from '@/constants/image';
import EmptyData from '@/components/ui/empty-data';
import { formatCompactNumber } from '@/utils/numberFormat';
import DeleteModal from '@/components/ui/DeleteModal';
import { getUnitLabel } from '@/constants/type';

export default function provision() {
  const { sectionColor, border, backgroundColor, labelColor, textColor } = useAppColors();
  const { devise } = useBudgetStore();
  const [provision, setProvision] = useState<Provision[]>([]);
  const [filtered, setFiltered] = useState<Provision[]>([]);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });

  const { search }: { search: string } = useLocalSearchParams();

  const loadData = async (search: string) => {
    const data = await getProvision();
    setProvision(data.sort((a: any, b: any) => b.id - a.id));
    const dataFiltered = search ? data.filter((d: Provision) => d.nom.toLowerCase().includes(search.toLowerCase())) : data;
    setFiltered(dataFiltered.sort((a: any, b: any) => b.id - a.id));
  };

  useFocusEffect(
    useCallback(() => {
      loadData(search);
    }, [search])
  );


  const handleDelete = async (action: string, id: string) => {

    if (action === "delete" && id) {
      const res = await deleteProvision(id);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData(search);
        setConfirmDelete({ show: false, id: "", message: "" });
      }
    };
    setConfirmDelete({ show: false, id: "", message: "" });
  };

  return (
    <View style={[styles.container]}>
      <DeleteModal onChange={handleDelete} visible={confirmDelete.show} message={confirmDelete.message} id={confirmDelete.id} />
      <Pressable
        onPress={() => router.push("/provision-form")}
        style={({ pressed }) => [
          styles.fab,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
          { backgroundColor: sectionColor, borderColor: border },
        ]}
      >
        <Plus color={"#fff"} size={24} />
      </Pressable>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1, position: "relative" }}
      >
        {provision.length === 0 &&
          <EmptyData
            message="Aucune provision enregistré."
            icon={<LucideApple size={100} color={labelColor} />}
          />}
        {filtered.length === 0 && search && provision.length > 0 &&
          <EmptyData
            message={`Aucune provision enregistré pour "${search}".`}
            icon={<Search size={100} color={labelColor} />}
          />}
        <View style={styles.grid}>
          {filtered.map((provision: Provision) => (
            <View key={provision.id} style={[styles.card, { backgroundColor, borderColor: border, position: "relative" }]}>
              <Pressable
                onPress={() => router.push({ pathname: `/detail-provision`, params: { id: provision.id } })}
              >
                <Image
                  source={provision.image ? { uri: provision.image } : depenseCoverImage("Alimentation")}
                  style={[
                    styles.image,
                    { borderColor: border },
                  ]}
                />

                <View style={styles.cardContent}>
                  <Text style={[styles.name, { color: textColor }]}>{provision.nom}</Text>
                  <Text style={[styles.text, { color: textColor }]}>{provision.quantite_initiale} {getUnitLabel(provision.unite)}</Text>
                  <Text style={styles.price}>{formatCompactNumber(provision.prix_total, devise)} </Text>
                  <Text style={[styles.date, { color: textColor }]}>{formatDateLong(provision.date_achat)} </Text>
                </View>

              </Pressable>
              <View style={[styles.actions]}>
                <Pressable
                  onPress={() => router.push({ pathname: "/provision-form", params: { id: provision.id } })}
                >
                  <Edit color={sectionColor} size={20} />
                </Pressable>
                <Pressable onPress={() => setConfirmDelete({ show: true, id: provision.id as string, message: `Voulez-vous vraiment supprimer la provision "${provision.nom}" ?` })}>
                  <LucideTrash2 color={"red"} size={22} />
                </Pressable>
              </View>
            </View>
          ))
          }
        </View >
      </ScrollView >
    </View >
  )
}
