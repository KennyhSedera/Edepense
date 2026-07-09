import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ToastAndroid, ActivityIndicator } from "react-native";
import Field from "../input/InputText";
import SelectChips from "../input/select-chips";
import { CATEGORIES } from "@/constants/type";
import { groq, parseExpense } from "@/utils/depense.util";
import { ModalProps, PriceMode } from "@/types/global";
import { XCircleIcon } from "lucide-react-native";
import { sendNotification } from "@/services/notificationService";
import { setDepense, setDepenses } from "@/controller/depense.controller";
import { setProvisions } from "@/controller/provision.controller";
import NetInfo from '@react-native-community/netinfo';
import EmptyData from "../ui/empty-data";
import { useAppNet } from "@/hooks/useAppNet";

export default function QuickAdd({ visible, onChange }: ModalProps) {
  const [message, setMessage] = useState("");
  const { backgroundColor, border, sectionColor, textColor, dangerColor } = useAppColors();
  const [categorie, setCategorie] = useState("Alimentation");
  const [prix, setPrix] = useState<PriceMode>("unit_price");
  const [error, setError] = useState("");
  const { isOnline } = useAppNet();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Le message ne peut pas être vide");
      return;
    }

    setLoading(true);
    if (isOnline) {
      const result = await groq(message.trim(), prix);
      const parsedResult: any = JSON.parse(result);

      try {
        parsedResult.provision.length > 0 && await setProvisions(parsedResult.provision);

        const res = await setDepenses(parsedResult.depense);
        const parsedResponse = JSON.parse(res);

        if (parsedResponse.success) {
          setLoading(false);
          await sendNotification({
            title: '💰 Nouvelle dépense ajoutée',
            body: parsedResponse.newDepenses.length + " nouveaux depenses vient d'être ajoutée avec ajout rapide type WhatsApp!",
            route: "/(detail)/detail-shopping",
            params: { id: parsedResponse.newDepenses[0].id },
          });

          ToastAndroid.show(parsedResponse.message, ToastAndroid.SHORT);
          handleClose();
        }
      } catch (error) {
        setLoading(false);
        console.log("Une erreur se produit : " + error);
        handleClose();
      }

    } else {
      const result = parseExpense(message.trim(), prix, categorie);

      try {
        result.provision.length > 0 && await setProvisions(result.provision);
        const res = await setDepense(result.depense);
        const json = JSON.parse(res);

        if (json.success) {
          await sendNotification({
            title: '💰 Nouvelle dépense ajoutée',
            body: "Une nouvelle depense vient d'être ajoutée avec ajout rapide type WhatsApp!",
            route: "/(detail)/detail-shopping",
            params: { id: json.newDepense.id },
          });

          ToastAndroid.show(json.message, ToastAndroid.SHORT);
          setLoading(false);
          handleClose();
        }
      } catch (error) {
        setLoading(false);
        console.log("Une erreur se produit : " + error);
        handleClose();
      }
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
      onRequestClose={handleClose}
    >

      <View style={[styles.card, styles.infoGridFull, { backgroundColor, marginBottom: 0, borderBottomWidth: 0, borderColor: border, position: "relative", flex: 1, height: "90%" }]}>
        <Pressable onPress={handleClose} style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
          <XCircleIcon size={24} color={dangerColor} />
        </Pressable>
        <Text style={[styles.title, { color: textColor, marginBottom: 50, textAlign: "left" }]}>
          Ajout rapide de dépense
        </Text>
        {loading ?
          <EmptyData
            icon={<ActivityIndicator size="large" />}
            message="Analyse des informations en cours..."
          /> :
          <>
            <View style={{ marginBottom: 10, paddingHorizontal: 10, backgroundColor }}>

              {!isOnline && <SelectChips
                data={CATEGORIES}
                label="Catégorie"
                value={categorie}
                setValue={(v) => setCategorie(v)}
              />}

              <SelectChips
                data={[{ value: "unit_price", label: "Prix unitaire" }, { value: "total_price", label: "Prix total" }]}
                label="Prix ajouté"
                value={prix}
                setValue={(v) => setPrix(v as PriceMode)}
              />

              <View>
                <Text style={[styles.text, { color: textColor, textTransform: "capitalize", flexDirection: "column" }]}>
                  Format text:
                </Text>
                <Text style={[styles.text, { color: sectionColor, paddingLeft: 10 }]}>
                  {`Tomates 1 kg 6000 / Oignons 200 / Riz 1 sac 16000 MGA`}
                </Text>
              </View>

            </View>

            <Field
              value={message}
              onChangeText={setMessage}
              placeholder={`Exemple: \nTomates 1 kg 6000 \nOignons 12 pieces 200 \nRiz 1 sac 16000`}
              multiline
              error={error}
              onFocus={() => setError("")}
              inputStyle={{ maxHeight: 400, minHeight: 120 }}
            />

            <Pressable
              style={[styles.miniButton, { backgroundColor: sectionColor, marginVertical: 10 }]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>
                Ajouter
              </Text>
            </Pressable>
          </>
        }
      </View>
    </Modal>
  );
}

