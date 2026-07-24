import Field from "@/components/input/InputText";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ToastAndroid, TouchableOpacity } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { addBudget, FindCategorieExistInBudget, getBudgetById, updateBudget, verifierDisponibiliteSource } from "@/controller/budget.controller";
import { Budget, BudgetFrequence } from "@/types/db";
import InputImage from "@/components/input/input-image";
import { MainHeader } from "@/components/header/header-main";
import { FormHeader } from "./_layout";
import { useAuth } from "@/contexts/AuthContext";
import { genererBlocCategories, GROUPES_BUDGET_SUGGERES, obtenirListeCategories } from "@/utils/categorie.util";
import SelectChipsMulti from "@/components/input/select-chips-multi";

export default function BudgetForm() {
  const [budgetName, setBudgetName] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [budgetImage, setBudgetImage] = useState("");
  const [frequence, setFrequence] = useState<BudgetFrequence>('mensuel');
  const [categoriesDisponibles, setCategoriesDisponibles] = useState<string[]>([]);
  const [categoriesSelectionnees, setCategoriesSelectionnees] = useState<string[]>([]);
  const [error, setError] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const { id }: { id: string } = useLocalSearchParams();

  const { sectionColor, border, cardBg, textColor, backgroundColor, labelColor } = useAppColors();

  const [source, setSource] = useState<'budget_mensuel' | 'salaire_mensuel'>('budget_mensuel');
  const [disponible, setDisponible] = useState<number | null>(null);

  useEffect(() => {
    async function checkDisponibilite() {
      if (!user?.id) return;
      const result = await verifierDisponibiliteSource(source, 0, user.id, id);
      setDisponible(result.disponible);
    }

    checkDisponibilite();
  }, [source, user?.id, id]);

  useEffect(() => {
    async function chargerCategories() {
      const toutes = obtenirListeCategories();
      const dejaUtilisees = await FindCategorieExistInBudget();

      if (id) {
        const budget = await getBudgetById(id);

        const categories = toutes.filter(
          (cat) =>
            !dejaUtilisees.includes(cat) ||
            budget?.categories.includes(cat)
        );

        setCategoriesDisponibles(categories);
      } else {
        setCategoriesDisponibles(
          toutes.filter((cat) => !dejaUtilisees.includes(cat))
        );
      }
    }

    chargerCategories();
  }, [id]);

  async function reload(id: string) {
    const data = await getBudgetById(id);

    if (data) {
      setBudgetName(data.budgetName);
      setBudgetTotal(data.budgetTotal.toString());
      setBudgetImage(data.budgetImage ?? "");
      setFrequence(data.frequence);
      setCategoriesSelectionnees(data.categories);
      setSource(data.source);
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
          frequence: frequence ?? existing?.frequence,
          source: source ?? existing?.source,
          categories: categoriesSelectionnees ?? existing?.categories,
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
          frequence,
          source,
          categories: categoriesSelectionnees,
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

  const groupesDisponibles = Object.fromEntries(
    Object.entries(GROUPES_BUDGET_SUGGERES)
      .map(([nom, categories]) => [
        nom,
        categories.filter((cat) => categoriesDisponibles.includes(cat)),
      ])
      .filter(([, categories]) => categories.length > 0)
  );

  return (
    <MainHeader
      height={100}
      header={() => <FormHeader title="Formulaire de budget" />}
    >
      <View style={[styles.form, { borderColor: border, borderWidth: 1, backgroundColor: cardBg }]}>
        <InputImage value={budgetImage} setValue={(e) => setBudgetImage(e)} />
      </View>

      <View style={[styles.form, { backgroundColor: cardBg, borderColor: border, borderWidth: 1 }]}>
        <Text style={{ color: labelColor, fontSize: 13, marginBottom: 8 }}>Source du budget</Text>
        <View style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
          {(['budget_mensuel', 'salaire_mensuel'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSource(s)}
              style={{
                flex: 1, padding: 10, borderRadius: 8, alignItems: 'center',
                backgroundColor: source === s ? sectionColor : backgroundColor,
                borderWidth: 1, borderColor: border,
              }}
            >
              <Text style={{ color: source === s ? '#fff' : textColor, fontSize: 13 }}>
                {s === 'budget_mensuel' ? 'Budget mensuel' : 'Salaire mensuel'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {disponible !== null && (
          <Text style={{ color: labelColor, fontSize: 12, marginBottom: 15 }}>
            Disponible sur cette source : {disponible.toLocaleString('fr-FR')} {user?.devise}
          </Text>
        )}
        <Text style={{ color: labelColor, fontSize: 13, marginBottom: 8 }}>Fréquence de réinitialisation</Text>
        <View style={{ flexDirection: 'row', marginBottom: 15, gap: 8 }}>
          {(['quotidien', 'hebdomadaire', 'mensuel'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFrequence(f)}
              style={{
                flex: 1, padding: 10, borderRadius: 8, alignItems: 'center',
                backgroundColor: frequence === f ? sectionColor : backgroundColor,
                borderWidth: 1, borderColor: border,
              }}
            >
              <Text style={{ color: frequence === f ? '#fff' : textColor, fontSize: 13 }}>
                {f === 'quotidien' ? 'Quotidien' : f === 'hebdomadaire' ? 'Hebdomadaire' : 'Mensuel'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        <SelectChipsMulti
          label="Catégories associées"
          data={categoriesDisponibles}
          values={categoriesSelectionnees}
          setValues={setCategoriesSelectionnees}
          groupes={groupesDisponibles}
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