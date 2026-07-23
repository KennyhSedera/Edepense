import { STORAGE_LISTE_COURSE_KEY } from "@/constants/storage";
import { ListeCourse, CourseItem, Depense, DepenseItem } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserId } from "./user.controller";
import { setDepense } from "./depense.controller";
import * as Notifications from "expo-notifications";
import { addNotification } from "./notification.app.controller";

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

async function annulerNotificationListe(liste: ListeCourse) {
  if (liste.notification_id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(liste.notification_id);
    } catch {
      // ignore
    }
  }
}

async function planifierNotificationListe(liste: ListeCourse): Promise<string | undefined> {
  await annulerNotificationListe(liste);

  const restants = liste.items.filter((i) => !i.achete).length;
  if (!liste.date_achat || restants === 0) {
    return undefined;
  }

  const [annee, mois, jour] = liste.date_achat.split("-").map(Number);
  const dateNotif = new Date(annee, mois - 1, jour, 8, 0, 0);

  if (dateNotif.getTime() <= Date.now()) {
    return undefined;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") return undefined;
  }

  const uId = await getUserId();
  const titre = "🛒 Courses prévues aujourd'hui";
  const message = `"${liste.titre}" : ${restants} article(s) à acheter aujourd'hui.`;

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: titre,
      body: message,
      data: { pathName: "/course-detail", id: liste.id },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dateNotif },
  });

  await addNotification(uId as string, {
    type: "info",
    title: titre,
    message,
    data: { pathName: "/course-detail", id: liste.id },
  });

  return notifId;
}

export async function addListeCourse(liste: ListeCourse) {
  const notification_id = await planifierNotificationListe(liste);
  const data = await getAllListesCourse();
  const newData = [...data, { ...liste, notification_id }];
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Liste ajoutée avec succès.", liste });
}

export async function updateListeCourse(liste: ListeCourse) {
  const notification_id = await planifierNotificationListe(liste);
  const data = await getAllListesCourse();
  const newData = data.map((l) => (l.id === liste.id ? { ...liste, notification_id } : l));
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Liste mise à jour avec succès.", liste });
}

export async function addItemToListe(listeId: string, item: CourseItem) {
  const data = await getAllListesCourse();
  const cible = data.find((l) => l.id === listeId);
  if (!cible) return JSON.stringify({ success: false, message: "Liste introuvable." });

  const listeMaj = { ...cible, items: [...cible.items, item], updated_at: new Date().toISOString() };
  const notification_id = await planifierNotificationListe(listeMaj);

  const newData = data.map((l) => (l.id === listeId ? { ...listeMaj, notification_id } : l));
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Article ajouté avec succès." });
}

export async function toggleItemAchete(listeId: string, itemId: string) {
  const data = await getAllListesCourse();
  const cible = data.find((l) => l.id === listeId);
  if (!cible) return JSON.stringify({ success: false, message: "Liste introuvable." });

  const listeMaj = {
    ...cible,
    items: cible.items.map((i) => (i.id === itemId ? { ...i, achete: !i.achete } : i)),
    updated_at: new Date().toISOString(),
  };

  const notification_id = await planifierNotificationListe(listeMaj);

  const newData = data.map((l) => (l.id === listeId ? { ...listeMaj, notification_id } : l));
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Article mis à jour." });
}

export async function removeItemFromListe(listeId: string, itemId: string) {
  const data = await getAllListesCourse();
  const cible = data.find((l) => l.id === listeId);
  if (!cible) return JSON.stringify({ success: false, message: "Liste introuvable." });

  const listeMaj = {
    ...cible,
    items: cible.items.filter((i) => i.id !== itemId),
    updated_at: new Date().toISOString(),
  };
  const notification_id = await planifierNotificationListe(listeMaj);

  const newData = data.map((l) => (l.id === listeId ? { ...listeMaj, notification_id } : l));
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Article supprimé." });
}

export async function deleteListeCourse(id: string) {
  const data = await getAllListesCourse();
  const uId = await getUserId();
  const cible = data.find((l) => l.id === id && l.user_id === uId);
  if (cible) await annulerNotificationListe(cible);

  const newData = data.filter((l) => !(l.id === id && l.user_id === uId));
  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Liste supprimée avec succès." });
}

export async function convertirListeEnDepense(
  listeId: string,
  prixParItem: Record<string, number>,
  categorie: string = "Autres"
): Promise<string> {
  const liste = await getListeCourseById(listeId);
  if (!liste) {
    return JSON.stringify({ success: false, message: "Liste introuvable." });
  }

  const itemsAchetes = liste.items.filter((i) => i.achete && !i.converti);

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
  const result = JSON.parse(res);

  if (result.success) {
    const itemsAchetesIds = new Set(itemsAchetes.map((i) => i.id));
    await marquerItemsConvertis(listeId, itemsAchetesIds);
  }

  return res;
}

async function marquerItemsConvertis(listeId: string, itemIds: Set<string>) {
  const raw = JSON.parse(
    (await AsyncStorage.getItem(STORAGE_LISTE_COURSE_KEY)) || "[]"
  ) as ListeCourse[];

  const updated = raw.map((liste) => {
    if (liste.id !== listeId) return liste;
    return {
      ...liste,
      items: liste.items.map((item) =>
        itemIds.has(item.id) ? { ...item, converti: true } : item
      ),
      updated_at: new Date().toISOString(),
    };
  });

  await AsyncStorage.setItem(STORAGE_LISTE_COURSE_KEY, JSON.stringify(updated));
}