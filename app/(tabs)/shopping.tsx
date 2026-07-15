import {
  Pressable,
  Image,
  Text,
  View,
  ToastAndroid,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";
import { useBudgetStore } from "@/store/budgetStore";
import { Depense } from "@/types/db";
import { router } from "expo-router";
import { formatDateStringForDisplay } from '../../utils/date.util';
import { CheckCircle, Edit, LucideTrash2, Plus, Search, ShoppingBasket, } from "lucide-react-native";
import { deleteDepense, getByFiltered, getDepense, removeAllDepenses, removeDepenses } from "@/controller/depense.controller";
import { depenseCoverImage } from "@/constants/image";
import { styles } from "@/styles/styles";
import EmptyData from "@/components/ui/empty-data";
import { formatCompactNumber } from '@/utils/number.util';
import DeleteModal from "@/components/modal/DeleteModal";
import SelectDate from "@/components/input/select-date";
import { MainHeader } from "@/components/header/header-main";
import { TabHeader } from "./_layout";

export default function ShoppingScreen() {
  const { search } = useLocalSearchParams();
  const { textColor, backgroundColor, border, sectionColor, labelColor, successColor } = useAppColors();
  const [value, setValue] = React.useState("currentMonth");

  const { devise } = useBudgetStore();
  const [depenses, setDepenses] = React.useState<Depense[]>([]);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });

  const [selected, setSelected] = useState<Depense[]>([]);

  function handleSelection(depense: Depense) {
    if (selected.includes(depense)) {
      setSelected(selected.filter((d) => d.id !== depense.id));
    } else {
      setSelected([...selected, depense]);
    }
  }

  function handlePress(depense: Depense) {
    if (selected.length > 0) {
      if (selected.includes(depense)) {
        return setSelected(selected.filter((d) => d.id !== depense.id));
      } else {
        return setSelected([...selected, depense]);
      }
    }
    return router.push({
      pathname: "/detail-shopping",
      params: {
        id: depense.id,
      },
    });
  }

  const loadData = async () => {
    if (value === 'all') {
      const data = await getDepense();
      setDepenses(
        data.sort((a: Depense, b: Depense) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      return;
    }
    const data = await getByFiltered(value);
    setDepenses(
      data.sort((a: Depense, b: Depense) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [value])
  );

  const filteredDepenses = useMemo(() => {
    const query = Array.isArray(search) ? search[0] : search;

    if (!query) return depenses;

    return depenses.filter((d: Depense) =>
      d.description?.toLowerCase().includes(query.toLowerCase()) ||
      d.categorie?.toLowerCase().includes(query.toLowerCase())
    );
  }, [search, depenses]);

  const total = useMemo(() => {
    return filteredDepenses.reduce((acc, d) => acc + d.montant, 0);
  }, [filteredDepenses]);

  const handleDelete = async (action?: string, id?: string) => {
    if (action === "delete" && id) {
      const res = await deleteDepense(id);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData();
        setConfirmDelete({ show: false, id: "", message: "" });
      }
    }
    setConfirmDelete({ show: false, id: "", message: "" });
  };

  const handleDeleteMany = async (action?: string) => {
    if (action === "delete") {
      const res = await removeDepenses(selected);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData();
        setConfirmDelete({ show: false, id: "", message: "" });
        setSelected([]);
      }
    }
    setConfirmDelete({ show: false, id: "", message: "" });
    setSelected([]);
  };

  return (
    <MainHeader
      height={160}
      paddinBottom={0}
      header={() => <TabHeader title="Mes dépenses" />}
      fab={selected.length <= 0 ?
        <Pressable
          onPress={() => router.push("/shopping-form")}
          style={({ pressed }) => [
            styles.fab,
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            { backgroundColor: sectionColor, borderColor: border },
          ]}
        >
          <Plus color={"#fff"} size={24} />
        </Pressable> :
        <Pressable onPress={() => setConfirmDelete({
          show: true,
          message: "Voulez-vous vraiment supprimer ces depenses ?",
          id: selected[0].id
        })}
          style={({ pressed }) => [
            styles.fab,
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            { backgroundColor: 'red', borderColor: border },
          ]}
        >
          <LucideTrash2 color={"#fff"} size={22} />
        </Pressable>
      }
    >
      <DeleteModal onChange={selected.length > 0 ? handleDeleteMany : handleDelete} visible={confirmDelete.show} message={confirmDelete.message} id={confirmDelete.id} />

      <View style={[styles.header, { paddingHorizontal: 0 }]}>
        <SelectDate
          value={value}
          setValue={setValue}
          position={{
            top: 42,
            left: 0,
            width: 150
          }}
        />
        <Text style={[styles.title, { color: textColor }]}>
          {total.toLocaleString()} {devise}
        </Text>
      </View>

      {depenses.length === 0 &&
        <EmptyData
          message="Aucune dépense enregistré."
          icon={<ShoppingBasket size={50} color={labelColor} />}
        />}

      {filteredDepenses.length === 0 && search && depenses.length > 0 &&
        <EmptyData
          message={`Aucune depense enregistré pour "${search}".`}
          icon={<Search size={50} color={labelColor} />}
        />}

      {/* GRID */}
      <View style={styles.grid}>
        {filteredDepenses.map((depense: Depense) => {
          const isSelected = selected.find(d => d.id === depense.id);
          const num = selected.findIndex((i) => i.id === depense.id) + 1;

          return (
            <Pressable
              key={depense.id}
              style={[styles.card, { backgroundColor, borderColor: isSelected ? successColor : border, borderWidth: isSelected ? 2 : 1, position: "relative", overflow: "visible" }]}
              onPress={() => handlePress(depense)}
              onLongPress={() => handleSelection(depense)}
            >
              {isSelected && <View style={[styles.centered, { position: "absolute", top: 3, right: 3, zIndex: 1, backgroundColor: successColor, borderRadius: 100, width: 30, height: 30 }]}><Text style={{ color: "#fff" }}>{num}</Text></View>}
              <Image
                source={depenseCoverImage(depense?.categorie || "Loisirs")}
                style={[
                  styles.image,
                  { borderColor: border },
                ]}
              />
              <View style={styles.cardContent}>
                <Text style={[styles.name, { color: textColor }]}>
                  {depense.categorie}
                </Text>
                <Text style={styles.price}>
                  {formatCompactNumber(depense.montant, devise)}
                </Text>
                <Text style={[styles.date, { color: textColor }]}>
                  {formatDateStringForDisplay(depense.date)}
                </Text>
                {depense.items && <View>
                  <Text style={{ color: textColor }}>{depense.items?.length} Produits</Text>
                </View>}
              </View>

              <View style={[styles.actions]}>
                <Pressable
                  onPress={() => router.push({ pathname: "/shopping-form", params: { id: depense.id } })}
                >
                  <Edit color={sectionColor} size={20} />
                </Pressable>
                <Pressable onPress={() => setConfirmDelete({
                  show: true,
                  message: "Voulez-vous vraiment supprimer cette depense ?",
                  id: depense.id
                })}>
                  <LucideTrash2 color={"red"} size={22} />
                </Pressable>
              </View>
            </Pressable>
          )
        })}
      </View >
    </MainHeader>
  );
}
