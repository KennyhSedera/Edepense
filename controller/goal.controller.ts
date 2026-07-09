import { STORAGE_GOAL_KEY } from "@/constants/storage";
import { Goal } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserId } from "./user.controller";

export async function getGoal() {
  const data = await AsyncStorage.getItem(STORAGE_GOAL_KEY);

  if (!data) return [];

  const goal = JSON.parse(data || "[]") as Goal[];
  const uId = await getUserId();

  return goal.filter((g: any) => g.user_id === uId);
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
  const uId = await getUserId();
  const allGoals = JSON.parse((await AsyncStorage.getItem(STORAGE_GOAL_KEY)) || "[]") as Goal[];

  const remaining = allGoals.filter((g: any) => g.user_id !== uId);
  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(remaining));

  return JSON.stringify({
    success: true,
    message: "Goal supprimé avec succès.",
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
    message: "Goal mise à jour avec succès",
    goal,
  });
}

export async function deleteGoal(id: string) {
  const allGoals = JSON.parse((await AsyncStorage.getItem(STORAGE_GOAL_KEY)) || "[]") as Goal[];
  const newData = allGoals.filter((item: any) => item.id !== id);

  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Goal supprimé avec succès",
  });
}

export async function removeAllGoals() {
  const uId = await getUserId();
  const allGoals = JSON.parse((await AsyncStorage.getItem(STORAGE_GOAL_KEY)) || "[]") as Goal[];

  const remaining = allGoals.filter((g: any) => g.user_id !== uId);
  await AsyncStorage.setItem(STORAGE_GOAL_KEY, JSON.stringify(remaining));

  return JSON.stringify({
    success: true,
    message: "Goals supprimées avec succès.",
  });
}

export async function getGoalById(id: string) {
  const data = await getGoal();
  return data.find((d: Goal) => d.id === id);
}