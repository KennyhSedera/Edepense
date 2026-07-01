import { View, Text, Pressable, ToastAndroid } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useAppColors } from '@/hooks/useAppColors';
import { styles } from '@/styles/styles';
import Field from '@/components/ui/InputText';
import { ScrollView } from 'react-native';
import InputDate from '@/components/ui/input-date';
import { toISODate } from './../utils/dateFormat';
import { User } from '@/types/db';
import { setUser } from '@/db/user';
import { router } from 'expo-router';

export default function login() {
  const { gradient, cardBg, textColor, border, sectionColor } = useAppColors();
  const [data, setData] = React.useState<User>({
    id: new Date().getTime().toString(),
    name: "",
    email: "",
    budget_mensuel: "",
    budget_journalier: "",
    salaire_mensuel: "",
    devise: "Ar",
    date_debut: toISODate(new Date()),
    created_at: toISODate(new Date()),
    updated_at: toISODate(new Date()),
  });
  const [error, setError] = React.useState<Partial<Record<keyof User, string>>>({});

  function validate() {
    const errors: Partial<Record<keyof User, string>> = {};

    if (!data.name) {
      errors.name = "Le nom est requis.";
    }

    if (!data.email) {
      errors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "L'email est invalide.";
    }

    if (Number(data.salaire_mensuel) <= 0) {
      errors.salaire_mensuel = "Le salaire mensuel doit avoir une valeur positive.";
    }

    return errors;

  }

  async function handleSubmit() {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    try {
      const res = await setUser(data);
      const json = JSON.parse(res);
      if (json.success) {
        ToastAndroid.show(json.message, ToastAndroid.SHORT);
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.log(error);

    }

  }

  return (
    <LinearGradient
      colors={[gradient.from, gradient.to]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: "100%", height: "100%", alignItems: "center", paddingVertical: 50 }}
    >
      <ScrollView style={[styles.container, { width: "100%", borderRadius: 10 }]} contentContainerStyle={{ alignItems: "center" }}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border, width: "90%" }]}>
          <Text style={[styles.name, { color: textColor, textAlign: "center", marginBottom: 10 }]}>Création compte</Text>
          <View style={[styles.form]}>
            <Field
              label="Nom et prénom"
              placeholder="Ex: John Doe"
              value={data.name}
              onChangeText={(e) => setData({ ...data, name: e })}
              style={{ marginBottom: 10 }}
              compact
              error={error.name}
              onFocus={() => setError({ ...error, name: "" })}
            />

            <Field
              label="Email"
              placeholder="Ex: gh0lg@example.com"
              value={data.email}
              onChangeText={(e) => setData({ ...data, email: e })}
              style={{ marginBottom: 10 }}
              compact
              error={error.email}
              onFocus={() => setError({ ...error, email: "" })}
            />

            <Field
              label="Salaire mensuel"
              placeholder="Ex: 1000€"
              value={data.salaire_mensuel?.toString() || ""}
              onChangeText={(e) => setData({ ...data, salaire_mensuel: e })}
              style={{ marginBottom: 10 }}
              keyboardType='numeric'
              compact
              error={error.salaire_mensuel}
              onFocus={() => setError({ ...error, salaire_mensuel: "" })}
            />

            <Field
              label="Budget mensuel"
              placeholder="Ex: 1000€"
              value={data.budget_mensuel?.toString() || ""}
              onChangeText={(e) => setData({ ...data, budget_mensuel: e })}
              style={{ marginBottom: 10 }}
              keyboardType='numeric'
              compact
              error={error.budget_mensuel}
              onFocus={() => setError({ ...error, budget_mensuel: "" })}
            />

            <Field
              label="Budjet journalier estimée"
              placeholder="Ex: 1000€"
              value={data.budget_journalier?.toString() || ""}
              onChangeText={(e) => setData({ ...data, budget_journalier: e })}
              style={{ marginBottom: 10 }}
              keyboardType='numeric'
              compact
              error={error.budget_journalier}
              onFocus={() => setError({ ...error, budget_journalier: "" })}
            />

            <Field
              label="Devise principale"
              placeholder="Ex: €"
              value={data.devise}
              onChangeText={(e) => setData({ ...data, devise: e })}
              style={{ marginBottom: 10 }}
              compact
              error={error.devise}
              onFocus={() => setError({ ...error, devise: "" })}
            />

            <InputDate
              label="Date début par mois"
              value={data.date_debut}
              onChange={(e: string) => setData({ ...data, date_debut: e || "" })}
              error={error.date_debut}
              onFocus={() => setError({ ...error, date_debut: "" })}
            />

            <Pressable onPress={handleSubmit} style={[styles.miniButton, { backgroundColor: sectionColor, borderColor: border, alignItems: "center" }]}>
              <Text style={{ color: "white" }}>S'inscrire</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}