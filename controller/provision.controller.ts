import { STORAGE_PROVISION_KEY } from "@/constants/storage";
import { Provision } from "@/types/db";
import { getLocalUser } from "@/utils/token.util";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserId } from "./user.controller";

async function getAllProvisionRaw(): Promise<Provision[]> {
  const data = await AsyncStorage.getItem(STORAGE_PROVISION_KEY);
  const all = JSON.parse(data || "[]") as Provision[];
  const uId = await getUserId();

  return all.filter((d: any) => d.user_id === uId);
}

export async function getProvision(): Promise<Provision[]> {
  const data = await getAllProvisionRaw();
  return data.filter((d: Provision) => d.quantite_restante > 0);
}

export async function setProvision(provision: any) {
  const uId = await getUserId();
  const existingRaw = JSON.parse((await AsyncStorage.getItem(STORAGE_PROVISION_KEY)) || "[]") as Provision[];
  const userProvisions = existingRaw.filter((d: any) => d.user_id === uId);

  const existingNames = userProvisions.find((item: any) => item?.nom === provision.nom);

  provision.user_id = uId || "";

  let newUserData: any[];
  if (existingNames) {
    provision.quantite_initiale += existingNames.quantite_initiale;
    provision.quantite_restante += existingNames.quantite_restante;
    provision.prix_total += existingNames.prix_total;

    newUserData = userProvisions.map((item: any) => (item.nom === existingNames.nom ? provision : item));
  } else {
    newUserData = [...userProvisions, provision];
  }

  const otherUsersData = existingRaw.filter((d: any) => d.user_id !== uId);
  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify([...otherUsersData, ...newUserData]));

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

    for (const provision of provisions) {
      provision.user_id = uId || "";

      const existingItem = userProvisions.find((item: any) => item?.nom === provision.nom);

      if (existingItem) {
        const merged = {
          ...provision,
          quantite_initiale: provision.quantite_initiale + existingItem.quantite_initiale,
          quantite_restante: provision.quantite_restante + existingItem.quantite_restante,
          prix_total: provision.prix_total + existingItem.prix_total,
        };

        userProvisions = userProvisions.map((item: any) =>
          item.nom === existingItem.nom ? merged : item
        );
        provisionsAjoutees.push(merged);
      } else {
        userProvisions = [...userProvisions, provision];
        provisionsAjoutees.push(provision);
      }
    }

    await AsyncStorage.setItem(
      STORAGE_PROVISION_KEY,
      JSON.stringify([...otherUsersData, ...userProvisions])
    );

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

  provision.user_id = uId || "";
  const newData = existingRaw.map((item: any) => (item.id === id ? provision : item));

  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

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