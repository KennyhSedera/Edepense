import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Budget } from "@/types/db";
import { getBudgetById, deleteBudget } from "@/controller/budget.controller";
import { useAppColors } from "@/hooks/useAppColors";
import { MainHeader } from "@/components/header/header-main";
import { FormHeader } from "../(form)/_layout";
import { styles } from "@/styles/styles";
import { formatMoney } from "@/utils/number.util";
import { formatDateLong } from "@/utils/date.util";
import MenuButton, { MenuItem } from "@/components/input/MenuButton";
import { Pencil, Trash2 } from "lucide-react-native";
import DeleteModal from "@/components/modal/DeleteModal";
import RenderImage from "@/components/modal/render-image";
import { useAuth } from "@/contexts/AuthContext";

const FREQUENCE_LABELS: Record<string, string> = {
  quotidien: "Quotidien",
  hebdomadaire: "Hebdomadaire",
  mensuel: "Mensuel",
};

export default function DetailBudget() {
  const { id }: { id: string } = useLocalSearchParams();
  const router = useRouter();

  const {
    cardBg,
    border,
    textColor,
    dangerColor,
    sectionColor,
    backgroundColor,
  } = useAppColors();

  const { user } = useAuth();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getBudgetById(id);
      if (data) setBudget(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function handleDelete(action?: string, id?: string) {
    if (action !== "delete" || !id) {
      setConfirmDelete({ show: false, id: "", message: "" });
      return;
    }

    const res = await deleteBudget(id);
    const data = JSON.parse(res);
    if (data.success) {
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
      setConfirmDelete({ show: false, id: "", message: "" });
      router.back();
      return;
    }

    setConfirmDelete({ show: false, id: "", message: "" });
  }

  if (loading && !budget) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={sectionColor} />
      </View>
    );
  }

  if (!budget) return null;

  const utilise = budget.budgetTotal - budget.budgetRestant;
  const progress =
    budget.budgetTotal > 0
      ? Math.min(utilise / budget.budgetTotal, 1)
      : 0;

  return (
    <MainHeader
      height={100}
      header={() => <FormHeader title="Détail du budget" />}
    >
      <DeleteModal
        onChange={handleDelete}
        visible={confirmDelete.show}
        message={confirmDelete.message}
        id={confirmDelete.id}
      />

      <RenderImage
        value={
          budget.budgetImage
            ? { uri: budget.budgetImage }
            : require("@/assets/images/depense/log.jpg")
        }
        onChange={setShowImage}
        visible={showImage}
      />

      <Pressable
        onPress={() => setShowImage(true)}
        style={[
          styles.image,
          {
            backgroundColor: cardBg,
            borderColor: border,
            height: 200,
            marginBottom: 10,
            position: "relative",
          },
        ]}
      >
        <MenuButton position={{ right: 5, top: 5 }}>
          <MenuItem onPress={() => router.push({ pathname: "/budget-form", params: { id: budget.id } })}>
            <Pencil size={18} color={textColor} />
            <Text style={{ color: textColor }}>Modifier</Text>
          </MenuItem>

          <View style={{ height: 1, backgroundColor: border }} />

          <MenuItem
            onPress={() =>
              setConfirmDelete({
                show: true,
                id: budget.id,
                message: `Voulez-vous supprimer le budget "${budget.budgetName}" ?`,
              })
            }
          >
            <Trash2 size={18} color={dangerColor} />
            <Text style={{ color: dangerColor }}>Supprimer</Text>
          </MenuItem>
        </MenuButton>

        <Image
          source={
            budget.budgetImage
              ? { uri: budget.budgetImage }
              : require("@/assets/images/depense/log.jpg")
          }
          resizeMode="cover"
          style={[
            styles.previewImage,
            {
              width: "100%",
              height: "100%",
              borderWidth: 0,
            },
          ]}
        />
      </Pressable>

      <View style={styles.infoGrid}>
        <View
          style={[
            styles.infoGridFull,
            styles.miniCard,
            {
              backgroundColor: cardBg,
              borderColor: border,
            },
          ]}
        >
          <Text style={[styles.name, { color: textColor }]}>
            {budget.budgetName}
          </Text>

          <Text style={[styles.category, { color: textColor }]}>
            {budget.source === "budget_mensuel" ? "Budget mensuel" : "Salaire mensuel"}
          </Text>

          <Text style={[styles.category, { color: textColor, opacity: 0.7 }]}>
            Réinitialisation {FREQUENCE_LABELS[budget.frequence] || budget.frequence}
          </Text>

          <View style={{ marginVertical: 12, position: "relative", width: "100%", marginBottom: 28 }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: border, overflow: "hidden" }}>
              <View
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  backgroundColor: sectionColor,
                }}
              />
            </View>

            <Text style={[styles.date, { color: textColor, position: "absolute", left: 0, bottom: -18 }]}>
              0%
            </Text>

            {Math.round(progress * 100) > 10 && (
              <Text
                style={[
                  styles.text,
                  {
                    color: sectionColor,
                    position: "absolute",
                    left: `${Math.max(progress * 100 - 5, 0)}%`,
                    bottom: -18,
                    fontWeight: "700",
                  },
                ]}
              >
                {Math.round(progress * 100)}%
              </Text>
            )}

            {Math.round(progress * 100) < 90 && (
              <Text style={[styles.date, { color: textColor, position: "absolute", right: 0, bottom: -18 }]}>
                100%
              </Text>
            )}
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={[styles.date, { color: textColor, opacity: 0.6 }]}>Utilisé</Text>
              <Text style={[styles.price, { color: textColor }]}>{formatMoney(utilise, user?.devise || "MGA")}</Text>
            </View>

            <View>
              <Text style={[styles.date, { color: textColor, opacity: 0.6 }]}>Budget total</Text>
              <Text style={[styles.price, { color: sectionColor }]}>{formatMoney(budget.budgetTotal, user?.devise || "MGA")}</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={[styles.date, { color: textColor, opacity: 0.6 }]}>Budget restant</Text>
            <Text
              style={[
                styles.price,
                { color: budget.budgetRestant > 0 ? sectionColor : dangerColor },
              ]}
            >
              {formatMoney(budget.budgetRestant, user?.devise || "MGA")}
            </Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 18, gap: 8 }}>
            {(budget.categories ?? []).map((cat) => (
              <View
                key={cat}
                style={{
                  backgroundColor: sectionColor,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>{cat}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.date, { marginTop: 20, color: textColor }]}>
            Créé le {formatDateLong(budget.created_at)}
          </Text>
        </View>
      </View>
    </MainHeader>
  );
}