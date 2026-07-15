import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Trash2, Plus } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import Field from "@/components/input/InputText";
import SelectChipsMenu from "@/components/input/select-chips-menu";
import DatePickerCalendar from "@/components/modal/DatePickerCalendar";
import { styles } from "@/styles/styles";
import { UNITE, DIMENSION } from "@/constants/type";
import { toISODate, formatDateStringForDisplay } from "@/utils/date.util";
import { MainHeader } from "@/components/header/header-main";
import { FormHeader } from "./_layout";
import { useAuth } from "@/contexts/AuthContext";
import { addListeCourse, getListeCourseById, updateListeCourse } from "@/controller/liste-course.controller";
import { CourseItem, ListeCourse } from "@/types/db";
import { matchProduit } from "@/utils/produit-matcher";

type ItemForm = {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  achete?: boolean;
  produit_id?: string;
};

export default function CourseForm() {
  const [titre, setTitre] = useState("");
  const [dateAchat, setDateAchat] = useState(toISODate(new Date()));
  const [showCustomDateInput, setShowCustomDateInput] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [items, setItems] = useState<ItemForm[]>([]);
  const [error, setError] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [createdAt, setCreatedAt] = useState<string>("");

  const { user } = useAuth();
  const {
    textColor,
    border,
    cardBg,
    labelColor,
    sectionColor,
    inputBg,
    dangerColor,
  } = useAppColors();

  const params = useLocalSearchParams();
  const listeId = Array.isArray(params.id) ? params.id[0] : params.id;

  const loadData = useCallback(async (id: string) => {
    const data = await getListeCourseById(id);
    if (!data) return;

    setTitre(data.titre);
    setDateAchat(data.date_achat || toISODate(new Date()));
    setCreatedAt(data.created_at);
    setItems(
      data.items.map((item) => ({
        id: item.id,
        name: item.nom,
        quantity: item.quantite?.toString() || "",
        unit: item.unite || "piece",
        achete: item.achete,
        produit_id: item.produit_id,
      }))
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (listeId) {
        loadData(listeId);
      }
    }, [listeId, loadData])
  );

  function selectToday() {
    setDateAchat(toISODate(new Date()));
    setShowCustomDateInput(false);
  }

  function selectDemain() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDateAchat(toISODate(d));
    setShowCustomDateInput(false);
  }

  function openCustomDate() {
    setDateModalVisible(true);
  }

  function handleConfirmDate(v: string) {
    setDateAchat(v);
    setDateModalVisible(false);
  }

  function addItem() {
    setError({ ...error, produits: "" });
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", quantity: "1", unit: "piece", achete: false },
    ]);
  }

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): Record<string, string> | null {
    const errors: Record<string, string> = {};

    if (!titre.trim()) {
      errors.titre = "Le titre est requis.";
    }

    if (items.length === 0) {
      errors.produits = "Il faut entrer au moins un article.";
    }

    items.forEach((it, index) => {
      if (!it.name.trim()) {
        errors[`items.${index}.name`] = "Le nom de l'article est requis.";
      }

      const parsedQuantity = parseFloat(it.quantity);
      if (it.quantity.trim() && (isNaN(parsedQuantity) || parsedQuantity <= 0)) {
        errors[`items.${index}.quantity`] = "Quantité doit être un nombre supérieur à zéro.";
      }
    });

    return Object.keys(errors).length > 0 ? errors : null;
  }

  async function handleSave() {
    const errors = validate();
    if (errors) {
      setError(errors);
      return;
    }

    setSaving(true);
    try {
      const finalItems: CourseItem[] = items.map((it) => {
        const produit = matchProduit?.(it.name.trim());
        const quantite = it.quantity.trim() ? parseFloat(it.quantity) : undefined;

        return {
          id: it.id,
          nom: produit?.name ?? it.name.trim(),
          quantite,
          unite: it.unit || undefined,
          achete: it.achete ?? false,
          produit_id: produit?.id ?? it.produit_id,
        };
      });

      const now = new Date().toISOString();

      if (listeId) {
        const liste: ListeCourse = {
          id: listeId,
          titre: titre.trim(),
          date_achat: dateAchat || undefined,
          items: finalItems,
          user_id: user?.id || "",
          created_at: createdAt || now,
          updated_at: now,
        };

        const res = await updateListeCourse(liste);
        const response = JSON.parse(res);

        if (response.success) {
          ToastAndroid.show(response.message, ToastAndroid.SHORT);
          router.back();
        } else {
          ToastAndroid.show(response.message ?? "Erreur lors de la modification.", ToastAndroid.SHORT);
        }
      } else {
        const liste: ListeCourse = {
          id: Date.now().toString(),
          titre: titre.trim(),
          date_achat: dateAchat || undefined,
          items: finalItems,
          user_id: user?.id || "",
          created_at: now,
          updated_at: now,
        };

        const res = await addListeCourse(liste);
        const response = JSON.parse(res);

        if (response.success) {
          ToastAndroid.show(response.message, ToastAndroid.SHORT);
          router.replace({ pathname: "/course-detail", params: { id: liste.id } });
        } else {
          ToastAndroid.show(response.message ?? "Erreur lors de la création.", ToastAndroid.SHORT);
        }
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'enregistrer la liste.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MainHeader height={100} header={() => <FormHeader title={listeId ? "Modifier la liste" : "Nouvelle liste de courses"} />}>
      <DatePickerCalendar value={dateAchat} onChange={handleConfirmDate} visible={dateModalVisible} />

      <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, padding: 12 }]}>
        <Field
          label="Titre de la liste *"
          value={titre}
          onChangeText={(v) => {
            setTitre(v);
            if (error.titre) setError({ ...error, titre: "" });
          }}
          placeholder="Ex: Courses du weekend"
          error={error?.titre}
          onFocus={() => setError({ ...error, titre: "" })}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: labelColor }]}>Date à acheter</Text>
          <View style={styles.itemNumbersRow}>
            <DateQuickButton
              label="Aujourd'hui"
              active={!showCustomDateInput && dateAchat === toISODate(new Date())}
              onPress={selectToday}
              border={border}
              inputBg={inputBg}
              textColor={textColor}
              sectionColor={sectionColor}
            />
            <DateQuickButton
              label="Demain"
              active={
                !showCustomDateInput &&
                dateAchat ===
                toISODate(
                  (() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    return d;
                  })()
                )
              }
              onPress={selectDemain}
              border={border}
              inputBg={inputBg}
              textColor={textColor}
              sectionColor={sectionColor}
            />
            <DateQuickButton
              label="Choisir"
              active={
                dateAchat !== toISODate(new Date()) &&
                dateAchat !==
                toISODate(
                  (() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    return d;
                  })()
                )
              }
              onPress={openCustomDate}
              border={border}
              inputBg={inputBg}
              textColor={textColor}
              sectionColor={sectionColor}
            />
          </View>

          {showCustomDateInput ? (
            <TextInput
              value={dateAchat}
              onChangeText={setDateAchat}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={labelColor}
              style={[
                styles.input,
                { color: textColor, borderColor: border, backgroundColor: inputBg, marginTop: 8 },
              ]}
            />
          ) : (
            dateAchat !== "" && (
              <Text style={[styles.selectedDateText, { color: labelColor }]}>
                Date sélectionnée : <Text style={{ color: sectionColor }}>{formatDateStringForDisplay(dateAchat)}</Text>
              </Text>
            )
          )}
        </View>
      </View>

      {/* ITEMS */}
      <View style={{ flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: 1, marginBottom: 16 }}>
        <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: error.produits ? "red" : border, marginBottom: 0, padding: 12 }]}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.section, { color: sectionColor }]}>
              Articles ({items.length})
            </Text>
          </View>

          {items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.itemCard, { borderColor: border, backgroundColor: inputBg, position: "relative" }]}
            >
              <TouchableOpacity
                onPress={() => removeItem(index)}
                style={[
                  styles.iconButton,
                  styles.removeButton,
                  { position: "absolute", zIndex: 1, top: -10, right: -8, backgroundColor: dangerColor, borderWidth: 1, borderColor: border },
                ]}
              >
                <Trash2 color={"white"} size={18} />
              </TouchableOpacity>

              <Field
                label="Nom de l'article *"
                value={item.name}
                onChangeText={(v) => updateItem(index, { name: v })}
                placeholder="Ex : Tomates"
                compact
                error={error[`items.${index}.name`]}
                onFocus={() => setError({ ...error, [`items.${index}.name`]: "" })}
              />

              <View style={styles.itemNumbersRow}>
                <Field
                  label="Quantité"
                  value={item.quantity}
                  onChangeText={(v) => updateItem(index, { quantity: v })}
                  placeholder="1"
                  keyboardType="numeric"
                  style={{ flex: 1, marginRight: 8 }}
                  compact
                  error={error[`items.${index}.quantity`]}
                  onFocus={() => setError({ ...error, [`items.${index}.quantity`]: "" })}
                />

                <SelectChipsMenu
                  data={UNITE}
                  value={item?.unit || ""}
                  setValue={(e) => updateItem(index, { unit: e })}
                  position={{ top: 60, right: 0, width: DIMENSION.width - 70 }}
                  style={{ width: "35%" }}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addItemButton, { borderColor: sectionColor, zIndex: 1 }]}
            onPress={addItem}
          >
            <Plus color={sectionColor} size={16} style={{ marginRight: 6 }} />
            <Text style={[styles.buttonText, { color: sectionColor }]}>
              Ajouter un article
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: dangerColor }}>{error.produits}</Text>
      </View>

      {/* SAUVEGARDE */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: sectionColor, opacity: saving ? 0.6 : 1 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Enregistrement..." : listeId ? "Enregistrer la modification" : "Créer la liste"}
        </Text>
      </TouchableOpacity>
    </MainHeader>
  );
}

function DateQuickButton({
  label,
  active,
  onPress,
  border,
  inputBg,
  textColor,
  sectionColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  border: string;
  inputBg: string;
  textColor: string;
  sectionColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.dateButton,
        {
          borderColor: active ? sectionColor : border,
          backgroundColor: active ? sectionColor : inputBg,
        },
      ]}
    >
      <Text
        style={[
          styles.dateButtonText,
          { color: active ? "#ffffff" : textColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}