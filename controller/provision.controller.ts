import { STORAGE_PROVISION_KEY } from "@/constants/storage";
import { Provision } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserId } from "./user.controller";
import { logEntree, logSortie, logSortieSansImpact } from "./provision.mouvement.controller";

async function getAllProvisionRaw(): Promise<Provision[]> {
  const data = await AsyncStorage.getItem(STORAGE_PROVISION_KEY);
  const all = JSON.parse(data || "[]") as Provision[];
  const uId = await getUserId();

  return all.filter((d: any) => d.user_id === uId);
}

export async function getProvision(): Promise<Provision[]> {
  const data = await getAllProvisionRaw();
  return data;
}

export async function setProvision(provision: any) {
  const uId = await getUserId();
  const existingRaw = JSON.parse((await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]") as Provision[];
  const userProvisions = existingRaw.filter((d: any) => d.user_id === uId);

  const existingNames = userProvisions.find((item: any) => item?.nom === provision.nom);

  provision.user_id = uId || "";

  const quantiteAjoutee = provision.quantite_initiale;
  const prixUnitaireAjoute = provision.prix_unitaire;

  let newUserData: any[];
  if (existingNames) {
    provision.id = existingNames.id;
    provision.quantite_initiale += existingNames.quantite_initiale;
    provision.quantite_restante += existingNames.quantite_restante;
    provision.prix_total += existingNames.prix_total;

    newUserData = userProvisions.map((item: any) => (item.nom === existingNames.nom ? provision : item));
  } else {
    newUserData = [...userProvisions, provision];
  }

  const otherUsersData = existingRaw.filter((d: any) => d.user_id !== uId);
  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify([...otherUsersData, ...newUserData]));

  if (quantiteAjoutee > 0) {
    await logEntree(
      provision.id,
      quantiteAjoutee,
      provision.unite,
      prixUnitaireAjoute,
      existingNames ? "Réapprovisionnement" : "Achat initial"
    );
  }

  return JSON.stringify({
    success: true,
    message: "Provision ajouté avec succès.",
    provision,
  });
}

export async function setProvisions(provisions: Provision[]) {
  try {
    const uId = await getUserId();
    const existingRaw = JSON.parse(
      (await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]"
    ) as Provision[];

    let userProvisions = existingRaw.filter((d: any) => d.user_id === uId);
    const otherUsersData = existingRaw.filter((d: any) => d.user_id !== uId);

    const provisionsAjoutees: Provision[] = [];
    const entreesAEnregistrer: { id: string; quantite: number; unite: string; prix: number; note: string }[] = [];

    for (const provision of provisions) {
      provision.user_id = uId || "";

      const existingItem = userProvisions.find((item: any) => item?.nom === provision.nom);
      const quantiteAjoutee = provision.quantite_initiale;

      if (existingItem) {
        const merged = {
          ...provision,
          id: existingItem.id,
          quantite_initiale: provision.quantite_initiale + existingItem.quantite_initiale,
          quantite_restante: provision.quantite_restante + existingItem.quantite_restante,
          prix_total: provision.prix_total + existingItem.prix_total,
        };

        userProvisions = userProvisions.map((item: any) =>
          item.nom === existingItem.nom ? merged : item
        );
        provisionsAjoutees.push(merged);

        entreesAEnregistrer.push({
          id: merged.id,
          quantite: quantiteAjoutee,
          unite: merged.unite,
          prix: provision.prix_unitaire,
          note: "Réapprovisionnement",
        });
      } else {
        userProvisions = [...userProvisions, provision];
        provisionsAjoutees.push(provision);

        entreesAEnregistrer.push({
          id: provision.id,
          quantite: quantiteAjoutee,
          unite: provision.unite,
          prix: provision.prix_unitaire,
          note: "Achat initial",
        });
      }
    }

    await AsyncStorage.setItem(
      STORAGE_PROVISION_KEY,
      JSON.stringify([...otherUsersData, ...userProvisions])
    );

    for (const entree of entreesAEnregistrer) {
      if (entree.quantite > 0) {
        await logEntree(entree.id, entree.quantite, entree.unite, entree.prix, entree.note);
      }
    }

    return JSON.stringify({
      success: true,
      message: `${provisionsAjoutees.length} provision(s) ajoutée(s) avec succès.`,
      provisions: provisionsAjoutees,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      message: "Error adding provisions",
    });
  }
}
export async function removeProvision() {
  const uId = await getUserId();
  const existingRaw = JSON.parse((await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]") as Provision[];
  const remaining = existingRaw.filter((d: any) => d.user_id !== uId);

  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(remaining));

  return JSON.stringify({
    success: true,
    message: "Provision supprimé avec succès.",
  });
}

export async function updateProvision(provision: any, id: string) {
  const uId = await getUserId();
  const existingRaw = JSON.parse((await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]") as Provision[];

  const ancienneProvision = existingRaw.find((item: any) => item.id === id);

  provision.user_id = uId || "";
  const newData = existingRaw.map((item: any) => (item.id === id ? provision : item));

  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  if (ancienneProvision) {
    const delta = provision.quantite_restante - ancienneProvision.quantite_restante;

    if (delta > 0) {
      await logEntree(id, delta, provision.unite, provision.prix_unitaire, "Réapprovisionnement (modification)");
    } else if (delta < 0) {
      await logSortieSansImpact(id, Math.abs(delta), provision.unite, "Ajustement manuel (modification)");
    }
  }

  return JSON.stringify({
    success: true,
    message: "Provision mise à jour avec succès.",
    provision,
  });
}

export async function getProvisionById(id: string) {
  const data = await getAllProvisionRaw();
  return data.filter((d: any) => d.id === id)[0];
}

export async function deleteProvision(id: string) {
  const existingRaw = JSON.parse((await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]") as Provision[];
  const newData = existingRaw.filter((item: any) => item.id !== id);

  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Provision supprimé avec succès.",
  });
}

export async function deleteProvisions(data: Provision[]) {
  const existingRaw = await getAllProvisionRaw();
  const newData = existingRaw.filter((item: any) => !data.find((d: any) => d.id === item.id));

  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: `${data.length} provision(s) supprimée(s) avec succès.`,
  });
}