import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_PROVISION_CONSOMMATION_KEY, STORAGE_PROVISION_KEY } from "@/constants/storage";
import { Provision, ProvisionConsommation } from "@/types/db";
import { getUserId } from "./user.controller";
import * as Crypto from "expo-crypto";

const SEUIL_JOURS_ALERTE = 3;

async function getAllConsommationsRaw(): Promise<ProvisionConsommation[]> {
  const data = await AsyncStorage.getItem(STORAGE_PROVISION_CONSOMMATION_KEY);
  const all = JSON.parse(data || "[]") as ProvisionConsommation[];
  const uId = await getUserId();
  return all.filter(d => d.user_id === uId);
}

export async function getConsommationsByProvision(provisionId: string): Promise<ProvisionConsommation[]> {
  const all = await getAllConsommationsRaw();
  return all
    .filter(d => d.provision_id === provisionId)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

/**
 * Calcule la moyenne réelle de consommation par jour à partir de l'historique.
 * total consommé / nombre de jours écoulés depuis la 1ère consommation (ou date_achat si aucune conso encore).
 */
export async function getConsommationMoyenneParJour(provision: Provision): Promise<number> {
  const historique = await getConsommationsByProvision(provision.id);

  if (historique.length === 0) {
    // pas encore d'historique réel -> fallback sur l'estimation initiale saisie par l'utilisateur
    return provision.consommation_estimee_par_jour ?? 0;
  }

  const totalConsomme = historique.reduce((sum, c) => sum + c.quantite, 0);
  const premiereDate = new Date(historique[0].date);
  const maintenant = new Date();

  const joursEcoules = Math.max(
    1,
    Math.ceil((maintenant.getTime() - premiereDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  return totalConsomme / joursEcoules;
}

/**
 * Nombre de jours restants estimés avant épuisement du stock.
 * Retourne null si la moyenne de consommation est inconnue/nulle (impossible d'estimer).
 */
export async function getJoursRestants(provision: Provision): Promise<number | null> {
  const moyenne = await getConsommationMoyenneParJour(provision);
  if (!moyenne || moyenne <= 0) return null;
  return provision.quantite_restante / moyenne;
}

/**
 * Enregistre une utilisation (ex: "j'ai utilisé 2 unités aujourd'hui"),
 * décrémente le stock, et déclenche une alerte si le seuil est atteint.
 */
export async function logConsommation(provisionId: string, quantite: number) {
  const uId = await getUserId();
  if (!uId) return JSON.stringify({ success: false, message: "Utilisateur non identifié." });

  // 1. enregistrer l'entrée de consommation
  const allConsommations = JSON.parse(
    (await AsyncStorage.getItem(STORAGE_PROVISION_CONSOMMATION_KEY)) || "[]"
  ) as ProvisionConsommation[];

  const entry: ProvisionConsommation = {
    id: Crypto.randomUUID(),
    provision_id: provisionId,
    user_id: uId,
    quantite,
    date: new Date().toISOString(),
  };
  await AsyncStorage.setItem(
    STORAGE_PROVISION_CONSOMMATION_KEY,
    JSON.stringify([...allConsommations, entry])
  );

  // 2. décrémenter le stock de la provision
  const allProvisions = JSON.parse(
    (await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]"
  ) as Provision[];

  const provision = allProvisions.find(p => p.id === provisionId);
  if (!provision) return JSON.stringify({ success: false, message: "Provision introuvable." });

  const nouvelleQuantite = Math.max(0, provision.quantite_restante - quantite);
  const provisionMaj: Provision = { ...provision, quantite_restante: nouvelleQuantite };

  // 3. vérifier le seuil d'alerte
  const joursRestants = await getJoursRestants(provisionMaj);
  const stockBas = joursRestants !== null && joursRestants <= SEUIL_JOURS_ALERTE;

  if (stockBas && !provision.alerte_stock_envoyee) {
    provisionMaj.alerte_stock_envoyee = true;
  } else if (!stockBas) {
    provisionMaj.alerte_stock_envoyee = false;
  }

  const newData = allProvisions.map(p => (p.id === provisionId ? provisionMaj : p));
  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Consommation enregistrée.",
    provision: provisionMaj,
    joursRestants,
    alerteDeclenchee: stockBas && !provision.alerte_stock_envoyee,
  });
}