import { STORAGE_USER_KEY } from "@/constants/storage";
import { User } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getUser() {
  const data = await AsyncStorage.getItem(STORAGE_USER_KEY);
  const user = JSON.parse(data || "[]") as User[];

  return user[0];
}

export async function setUser(user: User) {
  try {
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify([user]));
    return JSON.stringify({
      success: true,
      message: "Utilisateur ajouté avec succès"
    });
  } catch (error) {
    console.log(error);
    return JSON.stringify({
      success: false,
      message: "Error adding user"
    });
  }
}

export async function removeUser() {
  await AsyncStorage.removeItem(STORAGE_USER_KEY);
}

export async function updateUser(user: User) {
  try {
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify([user]));
    return JSON.stringify({
      success: true,
      message: "Utilisateur mis à jour avec succès"
    });
  } catch (error) {
    console.log(error);
    return JSON.stringify({
      success: false,
      message: "Error updating user"
    });
  }
}

export async function getBudgetMensuel() {
  try {
    const user = await getUser();
    return user.budget_mensuel;
  } catch (error) {
    console.log(error);
    return 0;
  }
}