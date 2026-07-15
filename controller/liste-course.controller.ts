import { STORAGE_LISTE_COURSE_KEY } from "@/constants/storage";
import { ListeCourse, CourseItem, Depense, DepenseItem } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserId } from "./user.controller";
import { setDepense } from "./depense.controller";

export async function getAllListesCourse(): Promise<ListeCourse[]> {
  const data = await AsyncStorage.getItem(STORAGE_LISTE_COURSE_KEY);
  return JSON.parse(data || "[]") as ListeCourse[];
}

export async function getListesCourse(): Promise<ListeCourse[]> {
  const listes = await getAllListesCourse();
  const uId = await getUserId();
  return listes.filter((l) => l.user_id === uId);
}

export async function getListeCourseById(id: string): Promise<ListeCourse | null> {
  const listes = await getAllListesCourse();
  return listes.find((l) => l.id === id) ?? null;
}

export async function addListeCourse(liste: ListeCourse) {
  const data = await getAllListesCourse();
  const newData = [...data, liste];
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Liste ajoutée avec succès.", liste });
}

export async function updateListeCourse(liste: ListeCourse) {
  const data = await getAllListesCourse();
  const newData = data.map((l) => (l.id === liste.id ? liste : l));
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Liste mise à jour avec succès.", liste });
}

// Ajoute un item à une liste existante
export async function addItemToListe(listeId: string, item: CourseItem) {
  const data = await getAllListesCourse();
  const newData = data.map((l) =>
    l.id === listeId
      ? { ...l, items: [...l.items, item], updated_at: new Date().toISOString() }
      : l
  );
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Article ajouté avec succès." });
}

// Coche/décoche un item
export async function toggleItemAchete(listeId: string, itemId: string) {
  const data = await getAllListesCourse();
  const newData = data.map((l) =>
    l.id === listeId
      ? {
        ...l,
        items: l.items.map((i) => (i.id === itemId ? { ...i, achete: !i.achete } : i)),
        updated_at: new Date().toISOString(),
      }
      : l
  );
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Article mis à jour." });
}

// Supprime un item d'une liste
export async function removeItemFromListe(listeId: string, itemId: string) {
  const data = await getAllListesCourse();
  const newData = data.map((l) =>
    l.id === listeId
      ? { ...l, items: l.items.filter((i) => i.id !== itemId), updated_at: new Date().toISOString() }
      : l
  );
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Article supprimé." });
}

export async function deleteListeCourse(id: string) {
  const data = await getAllListesCourse();
  const uId = await getUserId();
  const newData = data.filter((l) => !(l.id === id && l.user_id === uId));
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Liste supprimée avec succès." });
}

export async function convertirListeEnDepense(
  listeId: string,
  prixParItem: Record<string, number>, // { itemId: prix }
  categorie: string = "Autres"
): Promise<string> {
  const liste = await getListeCourseById(listeId);
  if (!liste) {
    return JSON.stringify({ success: false, message: "Liste introuvable." });
  }

  const itemsAchetes = liste.items.filter((i) => i.achete);

  if (itemsAchetes.length === 0) {
    return JSON.stringify({ success: false, message: "Aucun article acheté à convertir." });
  }

  const depenseItems: DepenseItem[] = itemsAchetes.map((item) => ({
    id: item.id,
    name: item.nom,
    quantity: item.quantite ?? 0,
    unit: item.unite,
    unit_price: prixParItem[item.id] ?? 0,
    total_price: (item.quantite ?? 0) * (prixParItem[item.id] ?? 0),
  }));

  const montantTotal = depenseItems.reduce((total, item) => total + item.total_price, 0);

  const uId = await getUserId();

  const depense: Depense = {
    id: Date.now().toString(),
    categorie,
    date: new Date().toISOString(),
    description: liste.titre,
    items: depenseItems,
    montant: montantTotal,
    user_id: uId || "",
  };

  const res = await setDepense(depense);

  return res;
}