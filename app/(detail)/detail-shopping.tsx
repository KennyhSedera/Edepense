import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Button, ToastAndroid } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense } from "@/types/db";
import { useBudgetStore } from "@/store/budgetStore";
import { Pressable } from "react-native";
import { depenseCoverImage } from "@/constants/image";
import { deleteDepense, getDepenseById } from "@/db/depense";
import { formatDateLong } from '@/utils/dateFormat';
import { styles as style } from '@/styles/styles'
import { formatMoney } from "@/utils/numberFormat";
import MenuButton, { MenuItem } from "@/components/ui/MenuButton";
import { Edit2Icon, LucideEdit, Trash2 } from "lucide-react-native";
import DeleteModal from "@/components/ui/DeleteModal";
import { getUnitLabel } from '@/constants/type';

export default function DepenseDetail() {
  const { textColor, backgroundColor, border, cardBg, labelColor, sectionColor, itemBg, dangerColor } = useAppColors();
  const [depense, setDepenses] = React.useState<Depense>({ id: "", montant: 0, categorie: "", description: "", date: "", items: [] });
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });

  const params = useLocalSearchParams();
  const loadData = async () => {
    const data = await getDepenseById(params.id as string);
    setDepenses(data);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const items = depense?.items || [];

  const handleDelete = async (action: string, id: string) => {
    if (action === "delete") {
      const res = await deleteDepense(id);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData();
        router.back();
        setConfirmDelete({ show: false, id: "", message: "" });
      }
    }

    setConfirmDelete({ show: false, id: "", message: "" });
  }

  return (
    <View style={{ flex: 1 }}>
      <DeleteModal onChange={handleDelete} visible={confirmDelete.show} message={confirmDelete.message} id={depense.id} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <MenuButton>
          <MenuItem
            onPress={() => router.push({ pathname: '/shopping-form', params: { id: depense.id } })}
          >
            <LucideEdit size={18} color={textColor} />
            <Text style={{ color: textColor, fontSize: 15 }}>Modifier</Text>
          </MenuItem>
          <View style={{ height: 1, backgroundColor: border }} />
          <MenuItem
            onPress={() => setConfirmDelete({ show: true, id: depense.id, message: "Voulez-vous vraiment supprimer cette depense ?" })}
          >
            <Trash2 size={18} color={dangerColor} />
            <Text style={{ color: dangerColor, fontSize: 15 }}>Supprimer</Text>
          </MenuItem>
        </MenuButton>
        <Pressable style={[styles.image, { borderColor: border }]}>
          <Image
            source={depenseCoverImage(depense.categorie)}
            style={[{ borderRadius: 16, width: "100%", height: "100%" }]}
          />
        </Pressable>

        {/* INFOS */}
        <View style={styles.infoGrid}>
          <MiniCard
            label="Catégorie"
            value={depense?.categorie as string}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridFull}
          />
          <MiniCard
            label="Montant"
            value={`${formatMoney(depense?.montant) ?? ""} `}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridHalf}
          />
          <MiniCard
            label="Date"
            value={formatDateLong(depense?.date as string)}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridHalf}
          />
          <MiniCard
            label="Description"
            value={depense?.description as string}
            backgroundColor={backgroundColor}
            border={border}
            labelColor={labelColor}
            textColor={textColor}
            style={styles.infoGridFull}
          />
        </View>

        {/* ITEMS */}
        {items.length > 0 && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.section, { color: sectionColor }]}>
              Produits ({items.length})
            </Text>

            {items.map((item: any, index: number) => (
              <Pressable
                key={index}
                onPress={() => router.push({ pathname: "/detail-item", params: { id: item.id } })}
                style={[
                  styles.itemRow,
                  { backgroundColor: itemBg, borderColor: border },
                ]}
              >
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={[styles.itemImage, { borderColor: border }]}
                  />
                ) : (
                  <View
                    style={[
                      styles.itemImage,
                      styles.itemImagePlaceholder,
                      { borderColor: border, backgroundColor: cardBg },
                    ]}
                  >
                    <Text style={{ color: labelColor, fontSize: 11 }}>—</Text>
                  </View>
                )}

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.itemName, { color: textColor }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemQty, { color: labelColor }]}>
                    Quantité : {item.quantity} {item.unit && ` ( ${getUnitLabel(item.unit)})`}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: sectionColor }]}>
                  {formatMoney(item.total_price)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export function MiniCard({
  label,
  value,
  backgroundColor,
  border,
  labelColor,
  textColor,
  style,
}: {
  label: string;
  value?: string;
  backgroundColor: string;
  border: string;
  labelColor: string;
  textColor: string;
  style?: any;
}) {
  return (
    <View
      style={[
        styles.miniCard,
        { backgroundColor, borderColor: border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.value, { color: textColor }]}>
        {value || "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 5,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  headerAmount: {
    fontSize: 18,
    fontWeight: "700",
  },

  image: {
    width: "100%",
    height: 250,
    objectFit: "contain",
    borderRadius: 16,
    marginBottom: 6,
    borderWidth: 1,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 6,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  infoGridHalf: {
    width: "49%",
    marginBottom: 12,
  },

  infoGridFull: {
    width: "100%",
    marginBottom: 12,
  },

  miniCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },

  label: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  },

  section: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },

  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
  },

  itemImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
  },

  itemQty: {
    fontSize: 12,
    marginTop: 2,
  },

  itemTotal: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },
});