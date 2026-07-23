import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { STORAGE_PROVISION_MOUVEMENT_KEY, STORAGE_PROVISION_KEY } from "@/constants/storage";
import { Provision, ProvisionMouvement } from "@/types/db";
import { getUserId } from "./user.controller";
import { convertirUnite } from "@/utils/unit.conversion.util";

const SEUIL_JOURS_ALERTE = 3;

async function getAllMouvementsRaw(): Promise<ProvisionMouvement[]> {
  const data = await AsyncStorage.getItem(STORAGE_PROVISION_MOUVEMENT_KEY);
  const all = JSON.parse(data || "[]") as ProvisionMouvement[];
  const uId = await getUserId();
  return all.filter(d => d.user_id === uId);
}

export async function getMouvementsByProvision(provisionId: string): Promise<ProvisionMouvement[]> {
  const all = await getAllMouvementsRaw();
  return all
    .filter(d => d.provision_id === provisionId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function addMouvement(mouvement: Omit<ProvisionMouvement, "id" | "user_id">) {
  const uId = await getUserId();
  if (!uId) return;

  const all = JSON.parse(
    (await AsyncStorage.getItem(STORAGE_PROVISION_MOUVEMENT_KEY)) || "[]"
  ) as ProvisionMouvement[];

  const entry: ProvisionMouvement = {
    id: Crypto.randomUUID(),
    user_id: uId,
    ...mouvement,
  };

  await AsyncStorage.setItem(STORAGE_PROVISION_MOUVEMENT_KEY, JSON.stringify([...all, entry]));
}

export async function logEntree(
  provisionId: string,
  quantite: number,
  unite: string,
  prixUnitaire?: number,
  note?: string
) {
  await addMouvement({
    provision_id: provisionId,
    type: "entree",
    quantite,
    unite,
    prix_unitaire: prixUnitaire,
    note: note ?? "Achat / réapprovisionnement",
    date: new Date().toISOString(),
  });
}

async function getConsommationMoyenneParJour(provision: Provision): Promise<number> {
  const mouvements = (await getMouvementsByProvision(provision.id)).filter(m => m.type === "sortie");

  if (mouvements.length === 0) {
    return provision.consommation_estimee_par_jour ?? 0;
  }

  const totalConsomme = mouvements.reduce((sum, m) => sum + m.quantite, 0);
  const premiereDate = new Date(mouvements[mouvements.length - 1].date);
  const maintenant = new Date();

  const joursEcoules = Math.max(
    1,
    Math.ceil((maintenant.getTime() - premiereDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  return totalConsomme / joursEcoules;
}

export async function getJoursRestants(provision: Provision): Promise<number | null> {
  const moyenne = await getConsommationMoyenneParJour(provision);
  if (!moyenne || moyenne <= 0) return null;
  return provision.quantite_restante / moyenne;
}

export async function logSortieSansImpact(provisionId: string, quantite: number, unite: string, note?: string) {
  await addMouvement({
    provision_id: provisionId,
    type: "sortie",
    quantite,
    unite,
    note: note ?? "Ajustement",
    date: new Date().toISOString(),
  });
}

export async function logSortie(provisionId: string, quantite: number, uniteSaisie?: string) {
  const uId = await getUserId();
  if (!uId) return JSON.stringify({ success: false, message: "Utilisateur non identifié." });

  const allProvisions = JSON.parse(
    (await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]"
  ) as Provision[];

  const provision = allProvisions.find(p => p.id === provisionId);
  if (!provision) return JSON.stringify({ success: false, message: "Provision introuvable." });

  let quantiteConvertie = quantite;
  if (uniteSaisie && uniteSaisie !== provision.unite) {
    const converted = convertirUnite(quantite, uniteSaisie, provision.unite);
    if (converted === null) {
      return JSON.stringify({ success: false, message: `Conversion impossible de ${uniteSaisie} vers ${provision.unite}.` });
    }
    quantiteConvertie = converted;
  }

  await addMouvement({
    provision_id: provisionId,
    type: "sortie",
    quantite: quantiteConvertie,
    unite: provision.unite,
    note: "Consommation",
    date: new Date().toISOString(),
  });

  const nouvelleQuantite = Math.max(0, provision.quantite_restante - quantiteConvertie);
  const stockEpuise = nouvelleQuantite === 0;

  const provisionMaj: Provision = {
    ...provision,
    quantite_restante: nouvelleQuantite,
    quantite_initiale: stockEpuise ? 0 : provision.quantite_initiale,
    prix_total: stockEpuise ? 0 : provision.prix_total,
  };

  const joursRestants = await getJoursRestants(provisionMaj);
  const stockBas = joursRestants !== null && joursRestants <= SEUIL_JOURS_ALERTE;

  provisionMaj.alerte_stock_envoyee = stockBas ? (provision.alerte_stock_envoyee || false) : false;
  const alerteDeclenchee = stockBas && !provision.alerte_stock_envoyee;
  if (alerteDeclenchee) provisionMaj.alerte_stock_envoyee = true;

  const newData = allProvisions.map(p => (p.id === provisionId ? provisionMaj : p));
  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: stockEpuise ? "Stock épuisé." : "Consommation enregistrée.",
    provision: provisionMaj,
    joursRestants,
    alerteDeclenchee,
    stockEpuise,
  });
}

export async function ajouterEntreeManuelle(
  provisionId: string,
  quantite: number,
  uniteSaisie?: string,
  prixUnitaireAchat?: number
) {
  const uId = await getUserId();
  if (!uId) return JSON.stringify({ success: false, message: "Utilisateur non identifié." });

  const allProvisions = JSON.parse(
    (await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]"
  ) as Provision[];

  const provision = allProvisions.find(p => p.id === provisionId);
  if (!provision) return JSON.stringify({ success: false, message: "Provision introuvable." });

  let quantiteConvertie = quantite;
  if (uniteSaisie && uniteSaisie !== provision.unite) {
    const converted = convertirUnite(quantite, uniteSaisie, provision.unite);
    if (converted === null) {
      return JSON.stringify({ success: false, message: `Conversion impossible de ${uniteSaisie} vers ${provision.unite}.` });
    }
    quantiteConvertie = converted;
  }

  const prixAchat = prixUnitaireAchat ?? provision.prix_unitaire;
  const valeurAjoutee = quantiteConvertie * prixAchat;
  const variationPrix = prixAchat - provision.prix_unitaire;

  await addMouvement({
    provision_id: provisionId,
    type: "entree",
    quantite: quantiteConvertie,
    unite: provision.unite,
    prix_unitaire: prixAchat,
    note: variationPrix !== 0
      ? `Ajout manuel (prix ${variationPrix > 0 ? "en hausse" : "en baisse"})`
      : "Ajout manuel de stock",
    date: new Date().toISOString(),
  });

  const provisionMaj: Provision = {
    ...provision,
    quantite_restante: provision.quantite_restante + quantiteConvertie,
    quantite_initiale: provision.quantite_initiale + quantiteConvertie,
    prix_total: provision.prix_total + valeurAjoutee,
    prix_unitaire: prixAchat,
    alerte_stock_envoyee: false,
  };

  const newData = allProvisions.map(p => (p.id === provisionId ? provisionMaj : p));
  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  const joursRestants = await getJoursRestants(provisionMaj);

  return JSON.stringify({
    success: true,
    message: "Stock ajouté avec succès.",
    provision: provisionMaj,
    joursRestants,
    variationPrix,
  });
}