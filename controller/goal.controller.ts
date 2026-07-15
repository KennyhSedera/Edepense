import { LAST_CHECK_KEY, STORAGE_GOAL_KEY } from "@/constants/storage";
import { Goal, GoalFrequency, UserConnected } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserById, getUserId } from "./user.controller";
import { getDayFixed } from "@/utils/date.util";

export async function getGoal() {
  const data = await AsyncStorage.getItem(STORAGE_GOAL_KEY);

  if (!data) return [];

  const goal = JSON.parse(data || "[]") as Goal[];
  const uId = await getUserId();

  return goal.filter((g: any) => g.user_id === uId);
}

export async function getAllGoal() {
  const data = await AsyncStorage.getItem(STORAGE_GOAL_KEY);

  if (!data) return [];

  const goal = JSON.parse(data || "[]") as Goal[];

  return goal;
}

export async function setGoal(goal: Goal) {
  try {
    const uId = await getUserId();
    const allGoals = JSON.parse((await AsyncStorage.getItem(STORAGE_GOAL_KEY)) || "[]") as Goal[];

    (goal as any).user_id = uId || "";
    allGoals.push(goal);

    await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(allGoals));

    return JSON.stringify({
      success: true,
      message: "Objectif ajouté avec succès.",
      goal,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      message: "Error adding goal",
    });
  }
}

export async function removeGoal() {
  const uId = await getUserId();
  const allGoals = JSON.parse((await AsyncStorage.getItem(STORAGE_GOAL_KEY)) || "[]") as Goal[];

  const remaining = allGoals.filter((g: any) => g.user_id !== uId);
  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(remaining));

  return JSON.stringify({
    success: true,
    message: "Objectif supprimé avec succès.",
  });
}

export async function updateGoal(goal: Goal, id: string) {
  const uId = await getUserId();
  const allGoals = JSON.parse((await AsyncStorage.getItem(STORAGE_GOAL_KEY)) || "[]") as Goal[];

  (goal as any).user_id = uId || "";
  const newData = allGoals.map((item: any) => (item.id === id ? goal : item));

  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Objectif mise à jour avec succès",
    goal,
  });
}

export async function deleteGoal(id: string) {
  const allGoals = await getGoal();
  const newData = allGoals.filter((item: any) => item.id !== id);

  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Objectif supprimé avec succès",
  });
}

export async function removeAllGoals() {
  const uId = await getUserId();
  const allGoals = await getAllGoal();

  const remaining = allGoals.filter((g: any) => g.user_id !== uId);
  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(remaining));

  return JSON.stringify({
    success: true,
    message: "Tous les objectifs sont supprimées avec succès.",
  });
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const uId = await getUserId();
  const user: UserConnected = await getUserById(uId || "");

  const allGoals = await getAllGoal();
  const goal = allGoals.find((g) => g.id === id && g.user_id === uId);
  if (!goal) return null;

  const jourSalaire: number | undefined = getDayFixed(user?.date_debut);

  const goalMisAJour = await rattraperGoal(goal, jourSalaire);

  if (goalMisAJour.montant_actuel !== goal.montant_actuel) {
    const newData = allGoals.map((item) => (item.id === id ? goalMisAJour : item));
    await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(newData));
  }

  return goalMisAJour;
}

function prochaineDate(depuis: Date, frequence: GoalFrequency, jourSalaire?: number): Date {
  const d = new Date(depuis);

  switch (frequence) {
    case "journalier":
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      break;

    case "hebdomadaire":
      d.setDate(d.getDate() + 7);
      d.setHours(0, 0, 0, 0);
      break;

    case "mensuel": {
      d.setMonth(d.getMonth() + 1);
      if (jourSalaire) {
        const dernierJour = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(jourSalaire, dernierJour));
      }
      d.setHours(0, 0, 0, 0);
      break;
    }

    default:
      break;
  }

  return d;
}

export async function rattraperGoal(goal: Goal, jourSalaire?: number): Promise<Goal> {
  if (!goal.frequence || goal.frequence === "unique" || !goal.montant_regulier) {
    return goal;
  }

  const key = LAST_CHECK_KEY(goal.id);
  const stored = await AsyncStorage.getItem(key);
  let curseur = stored ? new Date(stored) : new Date(goal.created_at);

  const maintenant = new Date();
  let montantActuel = goal.montant_actuel;
  let periodesAjoutees = 0;

  let prochain = prochaineDate(curseur, goal.frequence, jourSalaire);

  while (prochain <= maintenant) {
    montantActuel += goal.montant_regulier;
    periodesAjoutees++;
    curseur = prochain;
    prochain = prochaineDate(curseur, goal.frequence, jourSalaire);

    if (periodesAjoutees > 1000) break;
  }

  if (periodesAjoutees > 0) {
    await AsyncStorage.setItem(key, curseur.toISOString());
    montantActuel = Math.min(montantActuel, goal.montant_cible ?? montantActuel);
    return { ...goal, montant_actuel: montantActuel };
  }

  return goal;
}