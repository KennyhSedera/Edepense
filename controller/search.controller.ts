import { Depense, DepenseItem, Goal, Provision } from "@/types/db";
import { getDepense, getDepenseById, getItemById } from "./depense.controller";
import { getGoal, getGoalById } from "./goal.controller";
import { getProvision, getProvisionById } from "./provision.controller";
import { getLocalUser } from "@/utils/token.util";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CURRENT_SEARCH_KEY } from "@/constants/storage";
import { getUserId } from "./user.controller";

async function getGlobalSearch(params: string) {
  const search = params.toLowerCase();

  const depense = await getDepense();
  const provision = await getProvision();
  const goal = await getGoal();

  const filteredDepense = depense.filter((d: Depense) =>
    d.categorie?.toLowerCase().includes(search) ||
    d.date?.toLowerCase().includes(search) ||
    d.description?.toLowerCase().includes(search)
  );

  const matchesSearch = (i: DepenseItem) =>
    i.name?.toLowerCase().includes(search) ||
    i.total_price?.toString().includes(search) ||
    i.unit_price?.toString().includes(search) ||
    i.quantity?.toString().includes(search) ||
    i.unit?.toLowerCase().includes(search);

  const items: DepenseItem[] = depense.flatMap((d: Depense) => d.items?.filter(matchesSearch) ?? []);

  const filteredProvision = provision.filter((d: Provision) =>
    d.nom?.toLowerCase().includes(search) ||
    d.prix_total?.toString().toLowerCase().includes(search) ||
    d.unite?.toLowerCase().includes(search) ||
    d.date_achat?.toLowerCase().includes(search) ||
    d.created_at?.toLowerCase().includes(search) ||
    d.consommation_estimee_par_jour?.toString().toLowerCase().includes(search)
  );

  const filteredGoal = goal.filter((d: Goal) =>
    d.titre?.toLowerCase().includes(search) ||
    d.type?.toLowerCase().includes(search) ||
    d.date_limite?.toLowerCase().includes(search) ||
    d.montant_actuel?.toString().toLowerCase().includes(search) ||
    d.montant_cible?.toString().toLowerCase().includes(search) ||
    d.created_at?.toLowerCase().includes(search)
  );

  return { depense: filteredDepense, provision: filteredProvision, goal: filteredGoal, items }
}

async function setCurrentSearch(params: string) {
  const uId = await getUserId();
  await AsyncStorage.setItem(`${CURRENT_SEARCH_KEY}_${uId}`, params);
}

async function getCurrentSearch(): Promise<string | null> {
  const uId = await getUserId();
  return await AsyncStorage.getItem(`${CURRENT_SEARCH_KEY}_${uId}`);
}

async function clearCurrentSearch() {
  const uId = await getUserId();
  await AsyncStorage.removeItem(`${CURRENT_SEARCH_KEY}_${uId}`);
}

const RECENT_SEARCH_KEY = "RECENT_SEARCH";
const MAX_RECENT = 10;

type RecentType = "depense" | "provision" | "budget" | "item";

type RecentEntry = {
  type: RecentType;
  id: string;
  clickedAt: string;
};

function recentKey(userId: string) {
  return `${RECENT_SEARCH_KEY}_${userId}`;
}

async function getRecentSearch(): Promise<RecentEntry[]> {
  const uId = await getUserId();
  if (!uId) return [];

  const data = await AsyncStorage.getItem(recentKey(uId));
  return JSON.parse(data || "[]") as RecentEntry[];
}

async function addRecentSearch(type: RecentType, id: string) {
  const uId = await getUserId();
  if (!uId) return;

  const existing = await getRecentSearch();

  const filtered = existing.filter((e) => !(e.type === type && e.id === id));

  const updated: RecentEntry[] = [
    { type, id, clickedAt: new Date().toISOString() },
    ...filtered,
  ].slice(0, MAX_RECENT);

  await AsyncStorage.setItem(recentKey(uId), JSON.stringify(updated));
}

async function clearRecentSearch() {
  const uId = await getUserId();
  if (!uId) return;
  await AsyncStorage.removeItem(recentKey(uId));
}

async function clearRecentSearchId(id: string) {
  const uId = await getUserId();
  if (!uId) return;
  const existing = await getRecentSearch();
  const filtered = existing.filter((e) => !(e.id === id));
  await AsyncStorage.setItem(recentKey(uId), JSON.stringify(filtered));

  return JSON.stringify({ success: true, message: "Recente recherche supprimée avec succès." });
}

// Recharge les données complètes de chaque entrée récente (pour affichage)
async function getRecentSearchWithData() {
  const recent = await getRecentSearch();

  if (!recent.length) return [];

  const results = await Promise.all(
    recent.map(async (entry) => {
      let data;
      switch (entry.type) {
        case "depense":
          data = await getDepenseById(entry.id);
          break;
        case "provision":
          data = await getProvisionById(entry.id);
          break;
        case "budget":
          data = await getGoalById(entry.id);
          break;
        case "item":
          data = await getItemById(entry.id);
          break;
      }
      return data ? { ...entry, data } : null;
    })
  );

  return results.filter(Boolean) as Array<RecentEntry & { data: any }>;
}

function getDetailRoute(type: RecentType): "/detail-shopping" | "/detail-provision" | "/detail-budget" | "/detail-item" {
  switch (type) {
    case "depense":
      return "/detail-shopping";
    case "provision":
      return "/detail-provision";
    case "budget":
      return "/detail-budget";
    case "item":
      return "/detail-item";
  }
}

export { getGlobalSearch, getCurrentSearch, setCurrentSearch, clearCurrentSearch, getRecentSearch, addRecentSearch, clearRecentSearch, getRecentSearchWithData, getDetailRoute, clearRecentSearchId };