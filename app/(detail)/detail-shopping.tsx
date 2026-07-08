import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Button, ToastAndroid } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";
import { Depense } from "@/types/db";
import { Pressable } from "react-native";
import { depenseCoverImage } from "@/constants/image";
import { deleteDepense, getDepenseById } from "@/controller/depense.controller";
import { formatDateLong } from '@/utils/date.util';
import { formatMoney } from "@/utils/number.util";
import MenuButton, { MenuItem } from "@/components/ui/MenuButton";
import { CameraOffIcon, LucideEdit, Trash2 } from "lucide-react-native";
import DeleteModal from "@/components/ui/DeleteModal";
import { getUnitLabel } from '@/constants/type';
import RenderImage from "@/components/ui/render-image";
import { styles } from "@/styles/styles";
import { MainHeader } from "@/components/header/header-main";
import { DetailHeader } from "./_layout";

export default function DepenseDetail() {
  const { textColor, backgroundColor, border, cardBg, labelColor, sectionColor, itemBg, dangerColor } = useAppColors();
  const [depense, setDepenses] = React.useState<Depense>({ id: "", montant: 0, categorie: "", description: "", date: "", items: [], user_id: "" });
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });
  const [showImage, setShowImage] = useState(false);

  const { id }: { id: string } = useLocalSearchParams();

  const loadData = async () => {
    const data = await getDepenseById(id);
    if (data && data.id) {
      setDepenses(data);
      return;
    }
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
        router.replace("/shopping");
        setConfirmDelete({ show: false, id: "", message: "" });
      }
    }
    setConfirmDelete({ show: false, id: "", message: "" });
  }

  return (
    <MainHeader
      height={100}
      header={() => <DetailHeader title="Détail dépense" />}
    >
      <Pressable
        onPress={() => setShowImage(true)}
        style={[styles.image, { borderColor: border, height: 200, marginBottom: 20, position: "relative" }]}
      >
        <MenuButton position={{ right: 5, top: 5 }}>
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
        <Image
          source={depenseCoverImage(depense?.categorie as string)}
          style={[{ width: "100%", height: "100%" }]}
          resizeMode="cover"
        />
      </Pressable>

      {/* INFOS */}
      <View style={styles.infoGrid}>
        <MiniCard
          label="Catégorie"
          value={getUnitLabel(depense?.categorie as string)}
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
        <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border }]}>
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
                  <CameraOffIcon size={20} color={labelColor} />
                </View>
              )}

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemName, { color: textColor }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQty, { color: labelColor }]}>
                  Quantité : {item.quantity} {` ( ${getUnitLabel(item.unit)})`}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: sectionColor }]}>
                {formatMoney(item.total_price)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <DeleteModal
        onChange={handleDelete}
        visible={confirmDelete.show}
        message={confirmDelete.message}
        id={depense.id}
      />

      <RenderImage
        value={depenseCoverImage(depense?.categorie as string)}
        onChange={setShowImage}
        visible={showImage}
      />

    </MainHeader>
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