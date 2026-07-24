import { STORAGE_DEPENSES_KEY } from "@/constants/storage";
import { Depense, DepenseItem } from "@/types/db";
import { getCycleStart, getDayFixed, getInfosPeriode, getSemaines, toISODate } from "@/utils/date.util";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserId } from "./user.controller";
import { getLocalUser } from "@/utils/token.util";
import { appliquerDepenseSurBudget, annulerDepenseSurBudget, ajusterDepenseSurBudget } from "./budget.controller";

async function getDepense(): Promise<Depense[]> {
  const data = await AsyncStorage.getItem(STORAGE_DEPENSES_KEY);
  const depenses = JSON.parse(data || "[]") as Depense[];

  const uId = await getUserId();
  return depenses.filter((d: Depense) => d.user_id === uId);
}

async function getDepenseToday() {
  const data = await getDepense();

  return data.filter((d: any) => toISODate(new Date(d.date)) === toISODate(new Date()));
}

async function getDepenseYesterday() {
  const data = await getDepense();
  const date = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + (new Date().getDate() - 1);

  return data.filter((d: any) => toISODate(new Date(d.date)) === toISODate(new Date(date)));
}

async function getDepenseCurrentMonth() {
  const data = await getDepense();
  const user = await getLocalUser();
  const { dateDebut, dateFin } = getInfosPeriode(getCycleStart(new Date().toISOString(), getDayFixed(user?.date_debut as string) || 20).toISOString());

  return data.filter((d: any) => new Date(d.date) >= new Date(dateDebut) && new Date(d.date) <= new Date(dateFin));
}

async function getDepenseCurrentYear() {
  const data = await getDepense();
  const currentYear = new Date().getFullYear();
  return data.filter((d: any) => new Date(d.date).getFullYear() === currentYear);
}

async function getDepenseCurrentSemaine() {
  const data = await getDepense();
  const now = new Date();

  const jour = now.getDay();
  const decalage = jour === 0 ? 6 : jour - 1;

  const dateDebut = new Date(now);
  dateDebut.setDate(now.getDate() - decalage);
  dateDebut.setHours(0, 0, 0, 0);

  const dateFin = new Date(dateDebut);
  dateFin.setDate(dateDebut.getDate() + 6);
  dateFin.setHours(23, 59, 59, 999);

  return data.filter((d: any) => {
    const date = new Date(d.date);
    return date >= dateDebut && date <= dateFin;
  });
}

async function removeAllDepenses() {
  await AsyncStorage.removeItem(STORAGE_DEPENSES_KEY);

  return JSON.stringify({
    success: true,
    message: "Depenses supprimées avec succès.",
  });
}

async function getDepenseParSemaine(date: string) {
  const data = await getDepense();
  if (data.length === 0) return [];

  const semaine = getSemaines(data[0].date);
  return semaine.filter((s: any) => s.dateDebut === date);
}

async function getDepenseById(id: string) {
  try {
    const data = await getDepense();

    const dataById = data.filter((d: any) => d.id === id)[0];

    return dataById ? dataById : {} as Depense;
  } catch (error) {
    console.log(error);
    return {} as Depense;
  }
}

async function getByFiltered(params: string) {
  const dataToday = await getDepenseToday();
  const dataYesterday = await getDepenseYesterday();
  const dataCurrentMonth = await getDepenseCurrentMonth();
  const dataCurrentSemaine = await getDepenseCurrentSemaine();
  const dataCurrentYear = await getDepenseCurrentYear();
  const dataDefault = await getDepense();

  const data = (() => {
    switch (params) {
      case 'currentYear':
        return dataCurrentYear;
      case 'yesterday':
        return dataYesterday;
      case 'today':
        return dataToday;
      case 'currentSemaine':
        return dataCurrentSemaine;
      case "currentMonth":
        return dataCurrentMonth;
      default:
        return dataDefault;
    }

  })();

  return data;
}

async function getItemById(params: string): Promise<DepenseItem | undefined> {
  const depense = await getDepense();

  const matchesSearch = (i: DepenseItem) => i.id === params;
  const items: DepenseItem[] = depense.flatMap((d: Depense) => d.items?.filter(matchesSearch) ?? []);

  return items[0];
}

const lastExpenseDateKey = (userId: string) => `LAST_EXPENSE_DATE_${userId}`;

async function setLastDepenseDate(
  userId: string,
  date: string = new Date().toISOString()
) {
  const value = new Date(date).toISOString().slice(0, 10);
  await AsyncStorage.setItem(lastExpenseDateKey(userId), value);
}

async function getLastDepenseDate(userId: string) {
  return await AsyncStorage.getItem(lastExpenseDateKey(userId));
}

async function compareLastDepenseDate(userId: string, date: string): Promise<boolean> {
  const last = await AsyncStorage.getItem(lastExpenseDateKey(userId));
  const current = new Date(date).toISOString().slice(0, 10);
  return last === current;
}

async function hasExpenseToday(userId: string): Promise<boolean> {
  const last = await AsyncStorage.getItem(lastExpenseDateKey(userId));
  const today = new Date().toISOString().slice(0, 10);
  return last === today;
}

function trouverDerniereListe(depenses: Depense[]): Depense | null {
  const listes = depenses.filter((d) => (d.items?.length ?? 0) > 1 && d.categorie === "Alimentation");
  if (listes.length === 0) return null;

  return listes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

async function setDepense(newDepense: Depense) {
  try {
    const existing: Depense[] = await getDepense();
    const uId = await getUserId();

    newDepense.user_id = uId || "";
    existing.push(newDepense);
    await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(existing));
    await setLastDepenseDate(uId || "", newDepense.date);

    await appliquerDepenseSurBudget(newDepense.categorie || "", newDepense.montant, uId || "");

    return JSON.stringify({
      success: true,
      message: "Dépense ajoutée avec succès.",
      newDepense,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      message: "Error adding depense",
    })
  }
}

async function setDepenses(newDepenses: Depense[]) {
  try {
    const existing: Depense[] = await getDepense();
    const uId = await getUserId();

    const depensesAvecUser = newDepenses.map((dep) => ({
      ...dep,
      user_id: uId || "",
    }));

    const updated = [...existing, ...depensesAvecUser];
    await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(updated));

    if (depensesAvecUser.length > 0) {
      const derniereDate = depensesAvecUser
        .map((d) => d.date)
        .sort()
        .reverse()[0];
      await setLastDepenseDate(uId || "", derniereDate);
    }

    for (const dep of depensesAvecUser) {
      await appliquerDepenseSurBudget(dep.categorie || "", dep.montant, uId || "");
    }

    return JSON.stringify({
      success: true,
      message: `${depensesAvecUser.length} dépense(s) ajoutée(s) avec succès.`,
      newDepenses: depensesAvecUser,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      message: "Error adding depenses",
    });
  }
}

async function deleteDepense(id: string) {
  const existing = await getDepense();
  const depenseASupprimer = existing.find((item) => item.id === id);

  const newData = existing.filter((item: any) => (item.id !== id));

  await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(newData));

  if (depenseASupprimer) {
    await annulerDepenseSurBudget(depenseASupprimer.categorie || "", depenseASupprimer.montant, depenseASupprimer.user_id);
  }

  return JSON.stringify({
    success: true,
    message: "Depense supprimée avec succès.",
  });
}

async function updateDepense(data: any, id: string) {
  const existing = await getDepense();
  const uId = await getUserId();
  const ancienneDepense = existing.find((item) => item.id === id);

  data.user_id = uId || "";
  const newData = existing.map((item: any) => (item.id === id ? data : item));

  await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(newData));

  if (ancienneDepense) {
    await ajusterDepenseSurBudget(
      ancienneDepense.categorie || "",
      ancienneDepense.montant,
      data.categorie,
      data.montant,
      uId || ""
    );
  } else {
    await appliquerDepenseSurBudget(data.categorie, data.montant, uId || "");
  }

  return JSON.stringify({
    success: true,
    message: "Depense mise à jour avec succès.",
    data,
  });
}

async function removeDepenses(depense: Depense[]) {
  try {
    const existing = await getDepense();
    const idsASupprimer = depense.map((d) => d.id);

    const newData = existing.filter((dep: Depense) => !idsASupprimer.includes(dep.id));

    await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(newData));

    const depensesReellementSupprimees = existing.filter((dep) => idsASupprimer.includes(dep.id));
    for (const dep of depensesReellementSupprimees) {
      await annulerDepenseSurBudget(dep?.categorie || "", dep.montant, dep.user_id);
    }

    return JSON.stringify({
      success: true,
      message: `${existing.length - newData.length} dépense(s) supprimée(s) avec succès.`,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      message: "Error removing depenses",
    });
  }
}

export { getDepense, setDepense, deleteDepense, updateDepense, removeAllDepenses, getDepenseParSemaine, getDepenseCurrentMonth, getDepenseById, getByFiltered, getItemById, getLastDepenseDate, setLastDepenseDate, compareLastDepenseDate, hasExpenseToday, getDepenseCurrentSemaine, getDepenseCurrentYear, getDepenseToday, getDepenseYesterday, setDepenses, removeDepenses, trouverDerniereListe };