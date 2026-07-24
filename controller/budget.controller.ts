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

export async function setBudget(data: Budget[]) {
  await AsyncStorage.setItem(STORAGE_BUDGET_KEY, JSON.stringify(data));
  return;
}

export async function updateBudgets(budgets: Budget[]) {
  const data = await getAllBudget();
  const budgetsMap = new Map(budgets.map((b) => [b.id, b]));
  const newData = data.map((b: Budget) => budgetsMap.get(b.id) ?? b);

  await setBudget(newData);

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

async function trouverBudgetParCategorie(categorie: string, userId: string) {
  const budgets = await getAllBudget();

  let index = budgets.findIndex((b) => b.user_id === userId && b.categories.includes(categorie));

  if (index === -1) {
    index = budgets.findIndex((b) => b.user_id === userId && b.categories.includes('__NON_CATEGORISE__'));
  }

  if (index === -1) return null;
  return { budgets, index };
}

export async function appliquerDepenseSurBudget(categorie: string, montant: number, userId: string): Promise<boolean> {
  const result = await trouverBudgetParCategorie(categorie, userId);
  if (!result) return false;

  const { budgets, index } = result;
  budgets[index].budgetRestant -= montant;
  budgets[index].updated_at = new Date().toISOString();
  await setBudget(budgets);
  return true;
}

export async function annulerDepenseSurBudget(categorie: string, montant: number, userId: string) {
  const result = await trouverBudgetParCategorie(categorie, userId);
  if (!result) return;

  const { budgets, index } = result;
  budgets[index].budgetRestant += montant;
  budgets[index].updated_at = new Date().toISOString();
  await setBudget(budgets);
}

export async function ajusterDepenseSurBudget(
  ancienneCategorie: string,
  ancienMontant: number,
  nouvelleCategorie: string,
  nouveauMontant: number,
  userId: string
) {
  await annulerDepenseSurBudget(ancienneCategorie, ancienMontant, userId);
  await appliquerDepenseSurBudget(nouvelleCategorie, nouveauMontant, userId);
}

async function calculerMontantAlloue(
  source: 'budget_mensuel' | 'salaire_mensuel',
  userId: string,
  exclureBudgetId?: string
): Promise<number> {
  const budgets = await getAllBudget();
  return budgets
    .filter((b) => b.user_id === userId && b.source === source && b.id !== exclureBudgetId)
    .reduce((total, b) => total + b.budgetTotal, 0);
}

export async function verifierDisponibiliteSource(
  source: 'budget_mensuel' | 'salaire_mensuel',
  montantSouhaite: number,
  userId: string,
  exclureBudgetId?: string
): Promise<{ ok: boolean; disponible: number; message?: string }> {
  const user = await getUserById(userId);
  const montantSource = Number(source === 'budget_mensuel' ? user?.budget_mensuel : user?.salaire_mensuel) || 0;

  const dejaAlloue = await calculerMontantAlloue(source, userId, exclureBudgetId);
  const disponible = montantSource - dejaAlloue;

  if (montantSouhaite > disponible) {
    const nomSource = source === 'budget_mensuel' ? 'budget mensuel' : 'salaire mensuel';
    return {
      ok: false,
      disponible,
      message: `Montant disponible sur le ${nomSource} : ${disponible.toLocaleString('fr-FR')}. Vous essayez d'allouer ${montantSouhaite.toLocaleString('fr-FR')}.`,
    };
  }

  return { ok: true, disponible };
}

export async function addBudget(budget: Budget) {
  const data = await getAllBudget();

  const conflitCategorie = data.find(
    (b) => b.user_id === budget.user_id && b.categories.some((c) => budget.categories.includes(c))
  );
  if (conflitCategorie) {
    const categorieEnConflit = conflitCategorie.categories.find((c) => budget.categories.includes(c));
    return JSON.stringify({
      success: false,
      message: `La catégorie "${categorieEnConflit}" est déjà assignée au budget "${conflitCategorie.budgetName}".`,
    });
  }

  const disponibilite = await verifierDisponibiliteSource(budget.source, budget.budgetTotal, budget.user_id);
  if (!disponibilite.ok) {
    return JSON.stringify({ success: false, message: disponibilite.message });
  }

  const newData = [...data, budget];
  await setBudget(newData);

  return JSON.stringify({ success: true, message: "Budget ajouté avec succès." });
}

export async function updateBudget(budget: Budget) {
  const data = await getAllBudget();

  const conflitCategorie = data.find(
    (b) =>
      b.id !== budget.id &&
      b.user_id === budget.user_id &&
      b.categories.some((c) => budget.categories.includes(c))
  );
  if (conflitCategorie) {
    const categorieEnConflit = conflitCategorie.categories.find((c) => budget.categories.includes(c));
    return JSON.stringify({
      success: false,
      message: `La catégorie "${categorieEnConflit}" est déjà assignée au budget "${conflitCategorie.budgetName}".`,
    });
  }

  const disponibilite = await verifierDisponibiliteSource(budget.source, budget.budgetTotal, budget.user_id, budget.id);
  if (!disponibilite.ok) {
    return JSON.stringify({ success: false, message: disponibilite.message });
  }

  const newData = data.map((b: Budget) => (b.id === budget.id ? budget : b));
  await setBudget(newData);

  return JSON.stringify({ success: true, message: "Budget mis à jour avec succès." });
}

function doitReinitialiserAujourdhui(
  budget: Budget,
  today: Date,
  jourFixeMensuel: number
): boolean {
  const todayISO = today.toISOString().slice(0, 10);

  if (budget.budgetDateReinitialise === todayISO) return false;

  switch (budget.frequence) {
    case 'quotidien':
      return true;

    case 'hebdomadaire': {
      const derniereDate = new Date(budget.budgetDateReinitialise || budget.created_at);
      const joursEcoules = Math.floor((today.getTime() - derniereDate.getTime()) / (1000 * 60 * 60 * 24));
      return joursEcoules >= 7;
    }

    case 'mensuel':
      return today.getDate() === jourFixeMensuel;

    default:
      return false;
  }
}

export async function reinitBudget() {
  const uId = await getUserId();
  const allBudgets = await getAllBudget();
  const user = await getUserById(uId || "");
  const jourFixeMensuel = getDayFixed(user?.date_debut);
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  for (const b of allBudgets) {
    if (b.user_id !== uId) continue;

    if (doitReinitialiserAujourdhui(b, today, jourFixeMensuel)) {
      b.budgetRestant = b.budgetTotal + b.budgetRestant;
      b.budgetDateReinitialise = todayISO;
      b.updated_at = new Date().toISOString();
    }
  }

  await AsyncStorage.setItem(STORAGE_BUDGET_KEY, JSON.stringify(allBudgets));

  return JSON.stringify({ success: true, message: "Budgets mis à jour avec succès." });
}

export async function FindCategorieExistInBudget() {
  const allBudgets = await getBudget();
  const cat = allBudgets.map((b) => b.categories).flat();
  return cat;
}

export async function detecterCategoriesEnDoublon(userId: string): Promise<{ categorie: string; budgets: Budget[] }[]> {
  const budgets = (await getAllBudget()).filter((b) => b.user_id === userId);
  const map = new Map<string, Budget[]>();

  for (const b of budgets) {
    for (const cat of b.categories) {
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(b);
    }
  }

  return Array.from(map.entries())
    .filter(([, list]) => list.length > 1)
    .map(([categorie, list]) => ({ categorie, budgets: list }));
}

export async function getBudgetName(): Promise<{ value: string; label: string }[]> {
  const allBudgets = await getAllBudget();
  const budgetNames = allBudgets.map((b) => ({
    label: b.budgetName, value: b.budgetName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
  }));

  return budgetNames;
}