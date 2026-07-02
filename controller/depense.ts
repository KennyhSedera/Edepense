import { STORAGE_DEPENSES_KEY } from "@/constants/storage";
import { Depense, DepenseItem } from "@/types/db";
import { getCycleStart, getInfosPeriode, getSemaines, toISODate } from "@/utils/dateFormat";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getDepense(): Promise<Depense[]> {
  const data = await AsyncStorage.getItem(STORAGE_DEPENSES_KEY);
  return JSON.parse(data || "[]") as Depense[];
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
  const { dateDebut, dateFin } = getInfosPeriode(getCycleStart(new Date().toISOString(), 20).toISOString());

  return data.filter((d: any) => new Date(d.date) >= new Date(dateDebut) && new Date(d.date) <= new Date(dateFin));
}

async function getDepenseCurrentYear() {
  const data = await getDepense();
  const currentYear = new Date().getFullYear();
  return data.filter((d: any) => new Date(d.date).getFullYear() === currentYear);
}

async function getDepenseCurrentSemaine() {
  const data = await getDepense();
  const { dateDebut, dateFin } = getInfosPeriode(getCycleStart(new Date().toISOString(), 20).toISOString());

  return data.filter((d: any) => new Date(d.date) >= new Date(dateDebut) && new Date(d.date) <= new Date(dateFin));
}

async function setDepense(newDepense: any) {
  try {
    const existing: Depense[] = await getDepense();
    existing.push(newDepense);
    await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(existing));
    await setLastDepenseDate();

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

async function deleteDepense(id: string) {
  const existing = await getDepense();
  const newData = existing.filter((item: any) => (item.id !== id));

  await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Depense supprimée avec succès.",
  });
}

async function updateDepense(data: any, id: string) {
  const existing = await getDepense();
  const newData = existing.map((item: any) => (item.id === id ? data : item));

  await AsyncStorage.setItem(STORAGE_DEPENSES_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Depense mise à jour avec succès.",
    data,
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

async function getItemById(params: string) {
  const depense = await getDepense();

  const matchesSearch = (i: DepenseItem) => i.id === params
  const items: DepenseItem[] = depense.flatMap((d: Depense) => d.items?.filter(matchesSearch) ?? []);

  return items;
}

async function setLastDepenseDate(
  date: string = new Date().toISOString()
) {
  const value =
    new Date(date)
      .toISOString()
      .slice(0, 10);

  await AsyncStorage.setItem(
    "LAST_EXPENSE_DATE",
    value
  );
}

async function getLastDepenseDate() {
  return await AsyncStorage.getItem(
    "LAST_EXPENSE_DATE"
  );
}

async function compareLastDepenseDate(
  date: string
): Promise<boolean> {
  const last =
    await AsyncStorage.getItem(
      "LAST_EXPENSE_DATE"
    );

  const current =
    new Date(date)
      .toISOString()
      .slice(0, 10);

  return last === current;
}

async function hasExpenseToday(): Promise<boolean> {

  const last =
    await AsyncStorage.getItem(
      "LAST_EXPENSE_DATE"
    );

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  return last === today;
}

export { getDepense, setDepense, deleteDepense, updateDepense, removeAllDepenses, getDepenseParSemaine, getDepenseCurrentMonth, getDepenseById, getByFiltered, getItemById, getLastDepenseDate, setLastDepenseDate, compareLastDepenseDate, hasExpenseToday, getDepenseCurrentSemaine, getDepenseCurrentYear, getDepenseToday, getDepenseYesterday };