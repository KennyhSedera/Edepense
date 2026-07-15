import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ToastAndroid,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Trash2, Plus } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import type { Depense, DepenseItem } from "@/types/db";
import { formatDateStringForDisplay, toISODate } from "@/utils/date.util";
import DatePickerCalendar from '@/components/modal/DatePickerCalendar';
import Field from "@/components/input/InputText";
import { getDepenseById, setDepense, updateDepense } from "@/controller/depense.controller";
import { styles } from "@/styles/styles";
import { CATEGORIES, DIMENSION, UNITE } from "@/constants/type";
import SelectChips from "@/components/input/select-chips";
import { MainHeader } from "@/components/header/header-main";
import { FormHeader } from "./_layout";
import { useAuth } from "@/contexts/AuthContext";
import InputImage from "@/components/input/input-image";
import SelectChipsMenu from "@/components/input/select-chips-menu";

type ItemForm = {
  id: string;
  name: string;
  quantity: string;
  unit_price: string;
  image?: string;
  unit?: string,
  total_price: number;
};

export default function DepenseForm() {

  const [montant, setMontant] = useState("");
  const [categorie, setCategorie] = useState("Légumes");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));
  const [showCustomDateInput, setShowCustomDateInput] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const [items, setItems] = useState<ItemForm[]>([]);
  const [saving, setSaving] = useState(false);

  const devise = user?.devise || "MGA";

  const router = useRouter();
  const {
    textColor,
    border,
    cardBg,
    labelColor,
    sectionColor,
    inputBg,
    dangerColor
  } = useAppColors();

  const params = useLocalSearchParams();
  const depenseId = Array.isArray(params.id) ? params.id[0] : params.id;

  const loadData = async (id: string) => {
    const data = await getDepenseById(id);
    if (!data) {
      return null;
    }
    setMontant(data?.montant?.toString() || "");
    setCategorie(data?.categorie || "Alimentation");
    setDescription(data?.description || "");
    setDate(data?.date || toISODate(new Date()));
    setItems(
      data?.items?.map((item) => ({
        id: item.id || Date.now().toString(),
        name: item.name || "",
        quantity: item.quantity?.toString() || "0",
        unit_price: item.unit_price?.toString() || "0",
        image: item.image ?? undefined,
        unit: item.unit,
        total_price: item.total_price,
      })) || []
    );
  }

  useFocusEffect(
    useCallback(() => {
      if (depenseId) {
        loadData(depenseId);
      }
    }, [depenseId])
  );

  function selectToday() {
    setDate(toISODate(new Date()));
    setShowCustomDateInput(false);
  }

  function selectYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDate(toISODate(d));
    setShowCustomDateInput(false);
  }

  function openCustomDate() {
    setDateModalVisible(true);
  }

  function addItem() {
    setError({ ...error, produits: "" })
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", quantity: "1", unit_price: "0", image: undefined, total_price: 0, unit: "piece" },
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

  const itemsTotal = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.unit_price) || 0;
    return sum + qty * price;
  }, 0);

  function validate(): Record<string, string> | null {
    const errors: Record<string, string> = {};
    if (!montant.trim() || isNaN(parseFloat(montant))) {
      errors.montant = "Le montant est requis et doit être un nombre.";
    }

    if (!categorie.trim()) {
      errors.categorie = "La catégorie est requise.";
    }

    if (!date.trim()) {
      errors.date = "La date est requise.";
    }

    if (items.length === 0) {
      errors.produits = "Il faut entrer au moins un produit.";
    }

    items.forEach((it, index) => {
      const parsedQuantity = parseFloat(it.quantity);
      const parsedUnitPrice = parseFloat(it.unit_price);

      if (!it.name.trim()) {
        errors[`items.${index}.name`] = "Le nom du produit est requis.";
      }

      if (isNaN(parsedQuantity)) {
        errors[`items.${index}.quantity`] =
          "Quantité doit être un nombre valide.";
      } else if (parsedQuantity <= 0) {
        errors[`items.${index}.quantity`] =
          "Quantité doit être supérieur à zéro.";
      }

      if (isNaN(parsedUnitPrice)) {
        errors[`items.${index}.unit_price`] =
          "Prix unitaire doit être un nombre valide.";
      } else if (parsedUnitPrice <= 0) {
        errors[`items.${index}.unit_price`] =
          "Prix unitaire doit être supérieurs à zéro.";
      }
    });

    return Object.keys(errors).length > 0 ? errors : null;
  }

  async function handleSave() {
    const error = validate();
    if (error) {
      setError({ ...error });
      return;
    }

    setSaving(true);
    try {
      const finalItems: DepenseItem[] = items.map((it) => {
        const quantity = parseFloat(it.quantity) || 0;
        const unit_price = parseFloat(it.unit_price) || 0;
        return {
          id: it.id || Date.now().toString(),
          name: it.name.trim(),
          quantity,
          unit_price,
          total_price: quantity * unit_price,
          unit: it.unit,
          ...(it.image ? { image: it.image } : {}),
        };
      });

      const newDepense: Depense = {
        id: depenseId ? depenseId : Date.now().toString(),
        user_id: user?.id || "",
        montant: parseFloat(montant),
        categorie: categorie.trim(),
        description: description.trim(),
        date: date.trim(),
        ...(finalItems.length > 0 ? { items: finalItems } : {}),
      };

      const res = params.id ? await updateDepense(newDepense, depenseId) : await setDepense(newDepense);
      const response = JSON.parse(res);
      const condition = response.success;

      if (condition) {
        ToastAndroid.show(response.message, ToastAndroid.SHORT);
      }

      router.back();
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'enregistrer la dépense.");
    } finally {
      setSaving(false);
    }
  }

  const handleConfirmDate = (date: string) => {
    setDate(date);
    setDateModalVisible(false);
  }

  useEffect(() => {
    if (items) {
      let total: number = 0;
      items.forEach((item, i) => {
        const t = (parseFloat(item.unit_price) || 0) * (parseFloat(item.quantity) || 0)
        total += t;
      })

      setMontant(total.toString());
    }
  }, [items])


  return (
    <MainHeader
      height={100}
      header={() => <FormHeader title="Formulaire de Dépense" />}
    >
      <DatePickerCalendar value={date} onChange={(v: string) => handleConfirmDate(v)} visible={dateModalVisible} />

      <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, padding: 12 }]}>
        <Field
          label="Montant *"
          value={montant}
          onChangeText={setMontant}
          placeholder="0"
          keyboardType="numeric"
          error={error?.montant}
          onFocus={() => setError({ ...error, "montant": "" })}
          readOnly
        />

        <SelectChipsMenu
          label="Catégorie *"
          data={CATEGORIES}
          value={categorie}
          setValue={setCategorie}
          position={{ top: -20, right: 0, left: 0, }}
        />

        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Détails de la dépense"
          multiline
          error={error?.description}
          onFocus={() => setError({})}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: labelColor }]}>Date *</Text>
          <View style={styles.itemNumbersRow}>
            <DateQuickButton
              label="Hier"
              active={
                !showCustomDateInput &&
                date ===
                toISODate(
                  (() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    return d;
                  })()
                )
              }
              onPress={selectYesterday}
              border={border}
              inputBg={inputBg}
              textColor={textColor}
              sectionColor={sectionColor}
            />
            <DateQuickButton
              label="Aujourd'hui"
              active={!showCustomDateInput && date === toISODate(new Date())}
              onPress={selectToday}
              border={border}
              inputBg={inputBg}
              textColor={textColor}
              sectionColor={sectionColor}
            />
            <DateQuickButton
              label="Choisir"
              active={date !== toISODate(new Date()) && date !==
                toISODate(
                  (() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    return d;
                  })()
                )}
              onPress={openCustomDate}
              border={border}
              inputBg={inputBg}
              textColor={textColor}
              sectionColor={sectionColor}
            />
          </View>

          {showCustomDateInput ? (
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={labelColor}
              style={[
                styles.input,
                { color: textColor, borderColor: border, backgroundColor: inputBg, marginTop: 8 },
              ]}
            />
          ) : (
            date !== "" && (
              <Text style={[styles.selectedDateText, { color: labelColor }]}>
                Date sélectionnée : <Text style={{ color: sectionColor }}>{formatDateStringForDisplay(date)}</Text>
              </Text>
            )
          )}
        </View>
      </View>

      {/* ITEMS */}
      <View style={{ flexDirection: "column", alignItems: 'stretch', justifyContent: 'center', gap: 1, marginBottom: 16 }}>
        <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: error.produits ? "red" : border, marginBottom: 0, padding: 12 }]}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.section, { color: sectionColor }]}>
              Produits ({items.length})
            </Text>
            {items.length > 0 && (
              <Text style={[styles.itemsTotal, { color: labelColor }]}>
                Total : {itemsTotal.toLocaleString()} Ar
              </Text>
            )}
          </View>

          {items.map((item, index) => (
            <View
              key={index}
              style={[styles.itemCard, { borderColor: border, backgroundColor: inputBg, position: "relative" }]}
            >
              <TouchableOpacity
                onPress={() => removeItem(index)}
                style={[styles.iconButton, styles.removeButton, { position: 'absolute', zIndex: 1, top: -10, right: -8, backgroundColor: dangerColor, borderWidth: 1, borderColor: border }]}
              >
                <Trash2 color={"white"} size={18} />
              </TouchableOpacity>

              <InputImage
                value={item?.image}
                setValue={(e) => updateItem(index, { image: e })}
              />

              <Field
                label="Nom du produit *"
                value={item.name}
                onChangeText={(v) => updateItem(index, { name: v })}
                placeholder="Ex : Riz"
                compact
                error={error[`items.${index}.name`]}
                onFocus={() => setError({ ...error, [`items.${index}.name`]: "" })}
              />

              <View style={styles.itemNumbersRow}>
                <Field
                  label="Quantité"
                  value={item.quantity}
                  onChangeText={(v) => updateItem(index, { quantity: v, total_price: (parseFloat(v) || 0) * (parseFloat(item.unit_price) || 0) })}
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

              <Field
                label="Prix unitaire"
                value={item.unit_price}
                onChangeText={(v) => updateItem(index, { unit_price: v, total_price: (parseFloat(item.quantity) || 0) * (parseFloat(v) || 0) })}
                placeholder="0"
                keyboardType="numeric"
                style={{ flex: 1 }}
                compact
                error={error[`items.${index}.unit_price`]}
                onFocus={() => setError({ ...error, [`items.${index}.unit_price`]: "" })}
              />

              <Text style={[styles.itemLineTotal, { color: sectionColor }]}>
                ={" "}
                {(item.total_price).toLocaleString()}{" "}
                {devise}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addItemButton, { borderColor: sectionColor }]}
            onPress={addItem}
          >
            <Plus color={sectionColor} size={16} style={{ marginRight: 6 }} />
            <Text style={[styles.buttonText, { color: sectionColor }]}>
              Ajouter un produit
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
          {saving ? "Enregistrement..." : depenseId ? "Enregistrer la modification" : "Enregistrer la dépense"}
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
