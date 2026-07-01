import Field from "@/components/ui/InputText";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import { formatDateLong, toISODate } from "@/utils/dateFormat";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ToastAndroid,
} from "react-native";

import InputDate from "@/components/ui/input-date";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getGoalById, setGoal, updateGoal } from "@/db/goal";
import { Goal } from "@/types/db";
import InputImage from "@/components/ui/input-image";

export default function GoalForm() {
  const [titre, setTitre] = useState("");
  const [montantCible, setMontantCible] = useState("");
  const [dateLimite, setDateLimite] = useState(toISODate(new Date()));
  const [type, setType] = useState<"epargne" | "reduction_depense">("epargne");
  const [image, setImage] = useState('');
  const [montantActuel, setMontantActuel] = useState(0)
  const [error, setError] = useState<Record<string, string>>({});

  const types: { value: "epargne" | "reduction_depense", title: string }[] = [
    { value: "epargne", title: 'Epargné' },
    { value: "reduction_depense", title: 'Réduction dépense' },
  ]

  const { id }: { id: string } = useLocalSearchParams();

  const { sectionColor, border, textColor, cardBg, inputBg, labelColor } = useAppColors();

  async function reload(id: string) {
    const data = await getGoalById(id);

    if (data) {
      setTitre(data.titre);
      setImage(data.image as string);
      setDateLimite(data.date_limite);
      setType(data.type);
      setMontantCible(data.montant_cible.toString());
      setMontantActuel(data.montant_actuel);
    }
  }

  useFocusEffect(
    useCallback(
      () => {
        reload(id)
      },
      [id],
    )

  )

  function validate(): Record<string, string> | null {
    const errors: Record<string, string> = {};

    if (!titre.trim()) {
      errors.titre = "Le titre est requis.";
    }

    if (!montantCible.trim() || isNaN(parseFloat(montantCible))) {
      errors.montantCible = "Le montant cible est requis et doit être un nombre.";
    }

    if (!dateLimite.trim()) {
      errors.dateLimite = "La date limite est requise.";
    } else if (new Date(dateLimite) < new Date()) {
      errors.dateLimite = "La date limite ne peut pas être dans le passé.";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  const handleSubmit = async () => {
    const errors = validate();
    if (errors) {
      setError(errors);
      return;
    }

    const goal: Goal = {
      id: id ? id : Date.now().toString(),
      titre,
      type,
      date_limite: dateLimite,
      montant_cible: Number(montantCible),
      montant_actuel: type !== "epargne" ? Number(montantCible) : montantActuel,
      created_at: new Date().toISOString(),
      image,
    };

    try {
      let res = "";

      if (id) {
        res = await updateGoal(goal, id);
      } else {
        res = await setGoal(goal);
      }

      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        router.back();
      }
    } catch (error) {
      console.error(error);
    }

  };

  const closeDatePicker = (date: string) => {
    setDateLimite(date);
  };

  return (
    <ScrollView style={[styles.container, { padding: 12 }]}>

      <View style={[styles.form, { borderColor: border, borderWidth: 1, backgroundColor: cardBg }]}>
        <InputImage value={image} setValue={(e) => setImage(e)} />
      </View>
      <View style={[styles.form, { backgroundColor: cardBg, borderColor: border, borderWidth: 1 }]}>

        <Field
          label="Titre"
          value={titre}
          placeholder="Titre de l'objectif"
          onChangeText={(text) => setTitre(text)}
          error={error.titre}
          onFocus={() => setError({ ...error, titre: "" })}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: labelColor }]}>Type</Text>
          <View style={styles.chipsWrap}>
            {types.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setType(t.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: type === t.value ? sectionColor : border,
                    backgroundColor: type === t.value ? sectionColor : inputBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: type === t.value ? "#ffffff" : textColor },
                  ]}>{t.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Field
          label="Montant"
          value={montantCible}
          placeholder="Montant"
          onChangeText={(text) => setMontantCible(text)}
          keyboardType="numeric"
          error={error.montantCible}
          onFocus={() => setError({ ...error, montantCible: "" })}
        />

        <InputDate
          label="Date limite"
          value={dateLimite}
          onChange={closeDatePicker} error={error.dateLimite}
          onFocus={() => setError({ ...error, dateLimite: "" })}
        />
      </View>

      <Pressable
        style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 22, marginBottom: 50 }]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>{id ? "Modifier" : "Créer"} un objectif</Text>
      </Pressable>

    </ScrollView>
  );
}
