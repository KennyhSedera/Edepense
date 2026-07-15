import Field from "@/components/input/InputText";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import React, { useCallback, useState } from "react";
import { View, Text, Pressable, ToastAndroid } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { addBudget, getBudgetById, updateBudget } from "@/controller/budget.controller";
import { Budget } from "@/types/db";
import InputImage from "@/components/input/input-image";
import { MainHeader } from "@/components/header/header-main";
import { FormHeader } from "./_layout";
import { useAuth } from "@/contexts/AuthContext";

export default function BudgetForm() {
  const [budgetName, setBudgetName] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [budgetImage, setBudgetImage] = useState("");
  const [error, setError] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const { id }: { id: string } = useLocalSearchParams();

  const { sectionColor, border, cardBg } = useAppColors();

  async function reload(id: string) {
    const data = await getBudgetById(id);

    if (data) {
      setBudgetName(data.budgetName);
      setBudgetTotal(data.budgetTotal.toString());
      setBudgetImage(data.budgetImage ?? "");
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (id) reload(id);
    }, [id])
  );

  function validate(): Record<string, string> | null {
    const errors: Record<string, string> = {};

    if (!budgetName.trim()) {
      errors.budgetName = "Le nom du budget est requis.";
    }

    if (!budgetTotal.trim() || isNaN(parseFloat(budgetTotal)) || Number(budgetTotal) <= 0) {
      errors.budgetTotal = "Le montant total est requis et doit être un nombre positif.";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  const handleSubmit = async () => {
    const errors = validate();
    if (errors) {
      setError(errors);
      return;
    }

    const now = new Date().toISOString();
    const total = Number(budgetTotal);

    try {
      let res = "";

      if (id) {
        const existing = await getBudgetById(id);

        const budget: Budget = {
          id,
          budgetName,
          budgetTotal: total,
          budgetRestant: existing?.budgetRestant ?? total,
          budgetDateReinitialise: existing?.budgetDateReinitialise ?? now.slice(0, 10),
          budgetImage,
          user_id: user?.id || "",
          created_at: existing?.created_at ?? now,
          updated_at: now,
        };

        res = await updateBudget(budget);
      } else {
        const budget: Budget = {
          id: Date.now().toString(),
          budgetName,
          budgetTotal: total,
          budgetRestant: total,
          budgetDateReinitialise: now.slice(0, 10),
          budgetImage,
          user_id: user?.id || "",
          created_at: now,
          updated_at: now,
        };

        res = await addBudget(budget);
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

  return (
    <MainHeader
      height={100}
      header={() => <FormHeader title="Formulaire de budget" />}
    >
      <View style={[styles.form, { borderColor: border, borderWidth: 1, backgroundColor: cardBg }]}>
        <InputImage value={budgetImage} setValue={(e) => setBudgetImage(e)} />
      </View>

      <View style={[styles.form, { backgroundColor: cardBg, borderColor: border, borderWidth: 1 }]}>
        <Field
          label="Nom du budget"
          value={budgetName}
          placeholder="Ex: Courses, Transport..."
          onChangeText={(text) => setBudgetName(text)}
          error={error.budgetName}
          onFocus={() => setError({ ...error, budgetName: "" })}
        />

        <Field
          label="Montant total"
          value={budgetTotal}
          placeholder="Montant alloué"
          onChangeText={(text) => setBudgetTotal(text)}
          keyboardType="numeric"
          error={error.budgetTotal}
          onFocus={() => setError({ ...error, budgetTotal: "" })}
        />
      </View>

      <Pressable
        style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 22, marginBottom: 50 }]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>{id ? "Modifier" : "Créer"} un budget</Text>
      </Pressable>
    </MainHeader>
  );
}