import { Image, Pressable, ScrollView, Text, ToastAndroid, View } from 'react-native'
import React, { useCallback, useState } from 'react';
import { CheckCircle, Edit, LucideApple, LucideTrash2, Plus, Search, SearchSlash } from 'lucide-react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAppColors } from '@/hooks/useAppColors';
import { styles } from '@/styles/styles';
import { Provision } from '@/types/db';
import { deleteProvision, deleteProvisions, getProvision } from '@/controller/provision.controller';
import { useBudgetStore } from '@/store/budgetStore';
import { formatDateLong } from '@/utils/date.util';
import { depenseCoverImage } from '@/constants/image';
import EmptyData from '@/components/ui/empty-data';
import { formatCompactNumber } from '@/utils/number.util';
import DeleteModal from '@/components/modal/DeleteModal';
import { getUnitLabel } from '@/constants/type';
import { MainHeader } from '@/components/header/header-main';
import { TabHeader } from './_layout';

export default function ProvisionScreen() {
  const { sectionColor, border, backgroundColor, labelColor, textColor, dangerColor, successColor } = useAppColors();
  const { devise } = useBudgetStore();
  const [provision, setProvision] = useState<Provision[]>([]);
  const [filtered, setFiltered] = useState<Provision[]>([]);
  const [selected, setSelected] = useState<Provision[]>([]);
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
      let res: any = {};
      if (selected.length > 0) {
        res = await deleteProvisions(selected);
      } else {
        res = await deleteProvision(id);
      }
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData(search);
        setConfirmDelete({ show: false, id: "", message: "" });
        setSelected([]);
      }
    };
    setConfirmDelete({ show: false, id: "", message: "" });
    setSelected([]);
  };

  function handleSelect(provision: Provision) {
    if (selected.includes(provision)) {
      setSelected(selected.filter((p) => p.id !== provision.id));
    } else {
      setSelected([...selected, provision]);
    }
  }

  function handlePress(prov: Provision) {
    if (selected.length > 0) {
      if (selected.includes(prov)) {
        return setSelected(selected.filter((p) => p.id !== prov.id));
      } else {
        return setSelected([...selected, prov]);
      }
    }
    return router.push({
      pathname: `/detail-provision`,
      params: { id: prov.id }
    });
  }

  return (
    <MainHeader
      height={160}
      paddinBottom={10}
      header={() => <TabHeader title="Mes Provisions" />}
      fab={selected.length > 0 ?
        <Pressable onPress={() => setConfirmDelete({
          show: true,
          id: selected[0].id as string,
          message: `Voulez-vous vraiment supprimer ces provisions?`
        })} style={({ pressed }) => [
          styles.fab,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
          { backgroundColor: dangerColor, borderColor: border },
        ]}>
          <LucideTrash2 color={"#fff"} size={20} />
        </Pressable> :
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
      }
    >

      <DeleteModal onChange={handleDelete} visible={confirmDelete.show} message={confirmDelete.message} id={confirmDelete.id} />

      {provision.length === 0 &&
        <EmptyData
          message="Aucune provision enregistré."
          icon={<LucideApple size={50} color={labelColor} />}
        />}
      {filtered.length === 0 && search && provision.length > 0 &&
        <EmptyData
          message={`Aucune provision enregistré pour "${search}".`}
          icon={<Search size={50} color={labelColor} />}
        />}
      <View style={styles.grid}>
        {filtered.map((provision: Provision) => {
          const isSelected = selected.includes(provision);
          return (
            <View key={provision.id} style={[styles.card, { backgroundColor, borderColor: isSelected ? successColor : border, borderWidth: isSelected ? 2 : 1, position: "relative", overflow: "visible" }]}>
              {isSelected && <View style={{ position: "absolute", top: 3, right: 3, zIndex: 1, backgroundColor: successColor, borderRadius: 100, padding: 3 }}><CheckCircle color={"#fff"} size={16} /></View>}
              <Pressable
                onPress={() => handlePress(provision)}
                onLongPress={() => handleSelect(provision)}
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
          )
        })
        }
      </View >
    </MainHeader >
  )
}
