import { STORAGE_BUDGET_KEY } from "@/constants/storage";
import { Budget } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserById, getUserId } from "./user.controller";
import { getDayFixed } from "@/utils/date.util";

export async function getAllBudget(): Promise<Budget[]> {
  const data = await AsyncStorage.getItem(STORAGE_BUDGET_KEY);
  const budget = JSON.parse(data || "[]") as Budget[];

  return budget;
}

export async function getBudget(): Promise<Budget[]> {
  const budget = await getAllBudget();
  const uId = await getUserId();

  return budget.filter((b: Budget) => b.user_id === uId);
}

export async function getBudgetById(id: string) {
  const budgets = await getAllBudget();
  const budget = budgets.find((b: Budget) => b.id === id);

  return budget;
}

async function setBudget(data: Budget[]) {
  await AsyncStorage.setItem(STORAGE_BUDGET_KEY, JSON.stringify(data));
  return;
}

export async function addBudget(budget: Budget) {
  const data = await getAllBudget();
  const newData = [...data, budget];
  await setBudget(newData);

  return JSON.stringify({ success: true, message: "Budget ajouté avec succès." });
}

export async function updateBudget(budget: Budget) {
  const data = await getAllBudget();
  const newData = data.map((b: Budget) => (b.id === budget.id ? budget : b));
  await setBudget(newData);

  return JSON.stringify({ success: true, message: "Budget mis à jour avec succès." });
}

export async function updateBudgets(budgets: Budget[]) {
  const data = await getAllBudget();
  const budgetsMap = new Map(budgets.map((b) => [b.id, b]));
  const newData = data.map((b: Budget) => budgetsMap.get(b.id) ?? b);

  await setBudget(newData);

  return JSON.stringify({ success: true, message: "Budget mis à jour avec succès." });
}

export async function reinitBudget() {
  const uId = await getUserId();
  const allBudgets = await getAllBudget();
  const user = await getUserById(uId || "");
  const jourFixe = getDayFixed(user?.date_debut);
  const currentDateDay = new Date().getDate();
  const todayISO = new Date().toISOString().slice(0, 10);

  if (jourFixe === currentDateDay) {
    for (const b of allBudgets) {
      if (b.user_id === uId && b.budgetDateReinitialise !== todayISO) {
        b.budgetRestant = b.budgetTotal + b.budgetRestant;
        b.budgetDateReinitialise = todayISO;
        b.updated_at = new Date().toISOString();
      }
    }
  }

  await AsyncStorage.setItem(STORAGE_BUDGET_KEY, JSON.stringify(allBudgets));

  return JSON.stringify({ success: true, message: "Budget mis à jour avec succès." });
}

export async function deleteAllBudget() {
  await AsyncStorage.removeItem(STORAGE_BUDGET_KEY);

  return JSON.stringify({ success: true, message: "Tous les budgets supprimés avec succès." });
}

export async function deleteBudget(id: string) {
  const budget = await getAllBudget();

  const newData = budget.filter((b: Budget) => b.id !== id);
  await setBudget(newData);

  return JSON.stringify({ success: true, message: "Budget supprimé avec succès." });
}