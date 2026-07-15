import Field from "@/components/input/InputText";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import React, { useCallback, useState } from "react";
import { View, Pressable, ToastAndroid } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { addTodo, getTodoById, updateTodo } from "@/controller/todo.controller";
import { Todo } from "@/types/db";
import InputDate from "@/components/input/input-date";
import { MainHeader } from "@/components/header/header-main";
import { FormHeader } from "./_layout";
import { useAuth } from "@/contexts/AuthContext";
import { Text } from "react-native";

export default function TodoForm() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [dateEcheance, setDateEcheance] = useState("");
  const [error, setError] = useState<Record<string, string>>({});
  const { user } = useAuth();

  const { id }: { id: string } = useLocalSearchParams();
  const { sectionColor, border, cardBg } = useAppColors();

  async function reload(id: string) {
    const data = await getTodoById(id);
    if (data) {
      setTitre(data.titre);
      setDescription(data.description ?? "");
      setDateEcheance(data.date_echeance ?? "");
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (id) reload(id);
    }, [id])
  );

  function validate(): Record<string, string> | null {
    const errors: Record<string, string> = {};
    if (!titre.trim()) {
      errors.titre = "Le titre est requis.";
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

    try {
      let res = "";

      if (id) {
        const existing = await getTodoById(id);
        const todo: Todo = {
          id,
          titre,
          description,
          date_echeance: dateEcheance || undefined,
          completed: existing?.completed ?? false,
          user_id: user?.id || "",
          created_at: existing?.created_at ?? now,
          updated_at: now,
        };
        res = await updateTodo(todo);
      } else {
        const todo: Todo = {
          id: Date.now().toString(),
          titre,
          description,
          date_echeance: dateEcheance || undefined,
          completed: false,
          user_id: user?.id || "",
          created_at: now,
          updated_at: now,
        };
        res = await addTodo(todo);
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
    <MainHeader height={100} header={() => <FormHeader title="Formulaire de tâche" />}>
      <View style={[styles.form, { backgroundColor: cardBg, borderColor: border, borderWidth: 1 }]}>
        <Field
          label="Titre"
          value={titre}
          placeholder="Titre de la tâche"
          onChangeText={setTitre}
          error={error.titre}
          onFocus={() => setError({ ...error, titre: "" })}
        />

        <Field
          label="Description"
          value={description}
          placeholder="Détails (optionnel)"
          onChangeText={setDescription}
          multiline
        />

        <InputDate
          label="Date d'échéance (optionnel)"
          value={dateEcheance}
          onChange={setDateEcheance}
        />
      </View>

      <Pressable
        style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 22, marginBottom: 50 }]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>{id ? "Modifier" : "Créer"} la tâche</Text>
      </Pressable>
    </MainHeader>
  );
}