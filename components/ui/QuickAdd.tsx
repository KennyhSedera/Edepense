import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import React, { useState } from "react";
import { Modal, View, Text, Pressable, ToastAndroid } from "react-native";
import Field from "./InputText";
import SelectChips from "./select-chips";
import { CATEGORIES } from "@/constants/type";
import { parseExpense } from "@/utils/depense.util";
import { setDepense } from "@/controller/depense";
import { ModalProps, PriceMode } from "@/types/global";
import { sendNotification } from "@/services/notificationService";

export default function QuickAdd({ visible, onChange }: ModalProps) {
  const [message, setMessage] = useState("");
  const { backgroundColor, border, sectionColor, labelColor, textColor, inputBg } = useAppColors();
  const [categorie, setCategorie] = useState("Alimentation");
  const [prix, setPrix] = useState<PriceMode>("unit_price");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Le message ne peut pas être vide");
      return;
    }

    const result = parseExpense(message.trim(), prix, categorie);

    try {
      const res = await setDepense(result);
      const json = JSON.parse(res);

      if (json.success) {
        await sendNotification({
          title: '💰 Nouvelle dépense ajoutée',
          body: "Une nouvelle depense vient d'être ajoutée avec ajout rapide type WhatsApp!",
          route: "/(detail)/detail-shopping",
          params: { id: result.id },
        });

        ToastAndroid.show(json.message, ToastAndroid.SHORT);
        handleClose();
      }
    } catch (error) {
      console.log("Une erreur se produit : " + error);
      handleClose();
    }

  };

  function handleClose() {
    setMessage("");
    setError("");
    setCategorie("Alimentation");
    setPrix("unit_price");
    onChange();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <Pressable
        style={styles.overlay}
        onPress={handleClose}
      />

      <View style={[styles.card, styles.infoGridFull, { backgroundColor, marginBottom: 0, borderBottomWidth: 0, borderColor: border }]}>

        <View style={{ marginBottom: 10, paddingHorizontal: 10 }}>
          <Text style={[styles.title, { color: textColor, marginBottom: 10, textAlign: "center" }]}>
            Ajout rapide de dépense
          </Text>

          <SelectChips
            data={CATEGORIES}
            label="Catégorie"
            value={categorie}
            setValue={(v) => setCategorie(v)}
          />

          <SelectChips
            data={[{ value: "unit_price", label: "Prix unitaire" }, { value: "total_price", label: "Prix total" }]}
            label="Prix ajouté"
            value={prix}
            setValue={(v) => setPrix(v as PriceMode)}
          />

          <Text style={[styles.text, { color: textColor, textTransform: "capitalize" }]}>
            Format text: {" "}
            <Text style={[styles.name, { color: sectionColor, paddingLeft: 10 }]}>
              Tomates 6000 / Tomates 1 kg 6000
            </Text>
          </Text>
        </View>

        <Field
          value={message}
          onChangeText={setMessage}
          placeholder="Ex: Tomates 6000, Oignon 1 kg 6000"
          multiline
          error={error}
          onFocus={() => setError("")}
        />

        <Pressable
          style={[styles.miniButton, { backgroundColor: sectionColor, marginVertical: 10 }]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            Ajouter
          </Text>
        </Pressable>

      </View>
    </Modal>
  );
}

