import Field from "@/components/input/InputText";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import { formatDateLong, getCycleStart, getDayFixed, toISODate } from "@/utils/date.util";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ToastAndroid,
} from "react-native";

import InputDate from "@/components/input/input-date";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { getGoalById, setGoal, updateGoal } from "@/controller/goal.controller";
import { Goal, GoalFrequency } from "@/types/db";
import InputImage from "@/components/input/input-image";
import { MainHeader } from "@/components/header/header-main";
import { FormHeader } from "./_layout";
import { useAuth } from "@/contexts/AuthContext";
import InputSelect from "@/components/input/input-select";
import { GOAL_FREQUENCE, GOAL_SOURCE, GOAL_TYPE } from "@/constants/type";

function calculerDateLimite(
  montantCible: number,
  montantActuel: number,
  montantRegulier: number,
  frequence: GoalFrequency,
  jourSalaire?: number
): string {
  const restant = Math.max(montantCible - montantActuel, 0);

  if (!montantRegulier || montantRegulier <= 0 || restant === 0) {
    return toISODate(new Date());
  }

  const nbPeriodes = Math.ceil(restant / montantRegulier);
  const date = new Date();

  switch (frequence) {
    case "journalier":
      date.setDate(date.getDate() + nbPeriodes);
      break;

    case "hebdomadaire":
      date.setDate(date.getDate() + nbPeriodes * 7);
      break;

    case "mensuel": {
      if (jourSalaire) {
        date.setDate(1);
        date.setMonth(date.getMonth() + nbPeriodes);
        const dernierJourDuMois = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0
        ).getDate();
        date.setDate(Math.min(jourSalaire, dernierJourDuMois));
      } else {
        date.setMonth(date.getMonth() + nbPeriodes);
      }
      break;
    }

    default:
      break;
  }

  return toISODate(date);
}

export default function GoalForm() {
  const [titre, setTitre] = useState("");
  const [montantCible, setMontantCible] = useState("");
  const [dateLimite, setDateLimite] = useState(toISODate(new Date()));
  const [type, setType] = useState<"epargne" | "reduction_depense">("epargne");
  const [image, setImage] = useState("");
  const [montantActuel, setMontantActuel] = useState(0);

  const [frequence, setFrequence] = useState<GoalFrequency>("unique");
  const [montantRegulier, setMontantRegulier] = useState("");
  const [source, setSource] = useState("salaire");

  const [error, setError] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const { id }: { id: string } = useLocalSearchParams();

  const { sectionColor, border, textColor, cardBg, inputBg, labelColor } = useAppColors();
  const isRecurrent = frequence !== "unique";

  useEffect(() => {
    const sourceParFrequence: Record<GoalFrequency, string> = {
      unique: "salaire",
      journalier: "budget_journalier",
      hebdomadaire: "budget_hebdomadaire",
      mensuel: "budget_mensuel",
    };

    setSource(sourceParFrequence[frequence] ?? "salaire");
  }, [frequence]);

  const dateDebut = user?.date_debut
    ? getDayFixed(user.date_debut)
    : 1;

  const dateLimiteCalculee = useMemo(() => {
    if (!isRecurrent) return dateLimite;

    return calculerDateLimite(
      Number(montantCible) || 0,
      montantActuel,
      Number(montantRegulier) || 0,
      frequence,
      dateDebut
    );
  }, [isRecurrent, montantCible, montantActuel, montantRegulier, frequence, dateLimite, user]);

  async function reload(id: string) {
    const data = await getGoalById(id);

    if (data) {
      setTitre(data.titre);
      setImage(data.image as string);
      setDateLimite(data.date_limite ?? toISODate(new Date()));
      setType(data.type);
      setMontantCible(data.montant_cible?.toString() ?? "");
      setMontantActuel(data.montant_actuel);
      setFrequence(data.frequence ?? "unique");
      setMontantRegulier(data.montant_regulier?.toString() ?? "");
      setSource(data.source ?? "");
    }
  }

  useFocusEffect(
    useCallback(() => {
      reload(id);
    }, [id])
  );

  function validate(): Record<string, string> | null {
    const errors: Record<string, string> = {};

    if (!titre.trim()) {
      errors.titre = "Le titre est requis.";
    }

    if (!montantCible.trim() || isNaN(parseFloat(montantCible))) {
      errors.montantCible = "Le montant cible est requis et doit être un nombre.";
    }

    if (isRecurrent) {
      if (!montantRegulier.trim() || isNaN(parseFloat(montantRegulier))) {
        errors.montantRegulier = "Le montant régulier est requis et doit être un nombre.";
      }
    } else {
      if (!dateLimite.trim()) {
        errors.dateLimite = "La date limite est requise.";
      } else if (new Date(dateLimite) < new Date()) {
        errors.dateLimite = "La date limite ne peut pas être dans le passé.";
      }
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
      user_id: user?.id || "",
      titre,
      type,
      frequence,
      image,
      created_at: new Date().toISOString(),
      montant_cible: Number(montantCible),
      montant_actuel: type !== "epargne" && !isRecurrent ? Number(montantCible) : montantActuel,
      date_limite: isRecurrent ? dateLimiteCalculee : dateLimite,
      ...(isRecurrent
        ? {
          montant_regulier: Number(montantRegulier),
          source: source || undefined,
        }
        : {}),
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
    <MainHeader height={100} header={() => <FormHeader title="Formulaire d'objectif" />}>
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
            {GOAL_TYPE.map((t) => (
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
                <Text style={[styles.chipText, { color: type === t.value ? "#ffffff" : textColor }]}>
                  {t.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: labelColor }]}>Fréquence</Text>
          <View style={styles.chipsWrap}>
            {GOAL_FREQUENCE.map((f) => (
              <Pressable
                key={f.value}
                onPress={() => setFrequence(f.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: frequence === f.value ? sectionColor : border,
                    backgroundColor: frequence === f.value ? sectionColor : inputBg,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: frequence === f.value ? "#ffffff" : textColor }]}>
                  {f.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Field
          label="Montant cible"
          value={montantCible}
          placeholder="Montant à atteindre"
          onChangeText={(text) => setMontantCible(text)}
          keyboardType="numeric"
          error={error.montantCible}
          onFocus={() => setError({ ...error, montantCible: "" })}
        />

        {isRecurrent ? (
          <>
            <Field
              label="Montant régulier"
              value={montantRegulier}
              placeholder="Montant par période"
              onChangeText={(text) => setMontantRegulier(text)}
              keyboardType="numeric"
              error={error.montantRegulier}
              onFocus={() => setError({ ...error, montantRegulier: "" })}
            />
            <InputSelect
              label="Source"
              value={source}
              onChange={setSource}
              options={GOAL_SOURCE}
            />
            <View style={[styles.field]}>
              <Text style={[styles.label, { color: labelColor }]}>
                Date limite estimée
              </Text>
              <Text style={[styles.input, { color: textColor, backgroundColor: inputBg, borderColor: border, paddingVertical: 12 }]}>
                {formatDateLong(dateLimiteCalculee)}
              </Text>
            </View>
          </>
        ) : (
          <InputDate
            label="Date limite"
            value={dateLimite}
            onChange={closeDatePicker}
            error={error.dateLimite}
            onFocus={() => setError({ ...error, dateLimite: "" })}
          />
        )}
      </View>

      <Pressable
        style={[styles.miniButton, { backgroundColor: sectionColor, marginVertical: 20, }]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>{id ? "Modifier" : "Créer"} un objectif</Text>
      </Pressable>
    </MainHeader>
  );
}