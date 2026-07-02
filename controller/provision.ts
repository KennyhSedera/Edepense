import { STORAGE_PROVISION_KEY } from "@/constants/storage";
import { Provision } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getProvision() {
  const data = await AsyncStorage.getItem(STORAGE_PROVISION_KEY);

  const filtered = JSON.parse(data || "[]").filter((d: Provision) => d.quantite_restante > 0);

  return filtered || "[]";
}

export async function setProvision(provision: any) {
  let newData = [];
  const existing = await getProvision();

  const existingNames = existing.find((item: Provision) => item?.nom === provision.nom);

  if (existingNames) {
    provision.quantite_initiale += existingNames.quantite_initiale;
    provision.quantite_restante += existingNames.quantite_restante;
    provision.prix_total += existingNames.prix_total;

    newData = existing.map((item: any) => (item.nom === existingNames.nom ? provision : item));
  } else {
    newData = [...existing, provision];
  }

  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Provision ajouté avec succès.",
    provision,
  });
}

export async function removeProvision() {
  await AsyncStorage.removeItem(STORAGE_PROVISION_KEY);

  return JSON.stringify({
    success: true,
    message: "Provision supprimé avec succès.",
  });
}

export async function updateProvision(provision: any, id: string) {
  const existing = await getProvision();
  const newData = existing.map((item: any) => (item.id === id ? provision : item));

  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Provision mise à jour avec succès.",
    provision,
  });
}

export async function getProvisionById(id: string) {
  const data: Provision[] = await getProvision();
  return data.filter((d: any) => d.id === id)[0];
}

export async function deleteProvision(id: string) {
  const existing = await getProvision();
  const newData = existing.filter((item: any) => (item.id !== id));

  await AsyncStorage.setItem(STORAGE_PROVISION_KEY, JSON.stringify(newData));

  return JSON.stringify({
    success: true,
    message: "Provision supprimé avec succès.",
  });
}