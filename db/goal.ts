import { STORAGE_GOAL_KEY } from "@/constants/storage";
import { Goal } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getGoal() {
  const data = await AsyncStorage.getItem(STORAGE_GOAL_KEY);

  if (!data) return [];

  const goal = JSON.parse(data || "[]") as Goal[];

  return goal;
}

export async function setGoal(goal: Goal) {
  try {
    const existing = await getGoal();
    existing.push(goal);

    await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(existing));

    return JSON.stringify({
      success: true,
      message: "Goal ajouté avec succès.",
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
  await AsyncStorage.removeItem(STORAGE_GOAL_KEY);

  return JSON.stringify({
    success: true,
    message: "Goal supprimé avec succès.",
  });
}

export async function updateGoal(goal: Goal, id: string) {
  const existing = await getGoal();
  const newData = existing.map((item: any) => (item.id === id ? goal : item));

  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Goal mise à jour avec succès",
    goal,
  });
}

export async function deleteGoal(id: string) {
  const existing = await getGoal();
  const newData = existing.filter((item: any) => (item.id !== id));

  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Goal supprimé avec succès",
  });
}

export async function removeAllGoals() {
  await AsyncStorage.removeItem(STORAGE_GOAL_KEY);

  return JSON.stringify({
    success: true,
    message: "Goals supprimées avec succès.",
  });
}

export async function getGoalById(id: string) {
  const data = await getGoal();

  return data.find((d: Goal) => d.id === id);
}