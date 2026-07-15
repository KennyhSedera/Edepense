import { STORAGE_USER_KEY } from "@/constants/storage";
import { User, UserConnected } from "@/types/db";
import { verifyPassword } from "@/utils/criptage.util";
import { createLocalSession, getLocalUser, setLocalUser } from "@/utils/token.util";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getUser(id: string) {
  const data = await getAllUser();
  const user = data.find((u) => u.id === id);

  return user
}

export async function getAllUser() {
  const data = await AsyncStorage.getItem(STORAGE_USER_KEY);
  const user = JSON.parse(data || "[]") as User[];

  return user;
}

export async function setUser(user: User) {
  try {
    const users = await getAllUser();
    const existingUserEmail = users.find((u) => u.email === user.email);
    const existingUserName = users.find((u) => u.name === user.name);

    if (users.length >= 2) {
      return JSON.stringify({
        success: false,
        error: { email: "Limite de 2 utilisateurs atteinte" }
      });
    }

    if (existingUserName) {
      return JSON.stringify({
        success: false,
        error: { name: "Nom d'utilisateur déjà utilisé" }
      });
    }

    if (existingUserEmail) {
      return JSON.stringify({
        success: false,
        error: { email: "Adresse email déjà utilisée" }
      });
    }

    users.push(user);
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(users));

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

export async function removeAllUser() {
  await AsyncStorage.removeItem(STORAGE_USER_KEY);
}

export async function getBudgetMensuel(id: string) {
  try {
    const user = await getUser(id);
    if (!user) {
      return 0;
    }
    return user.budget_mensuel;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

export async function loginController(email: string, password: string) {
  const users = await getAllUser();

  const user = users.find((u) => u.email === email);

  if (!user) {
    return { success: false, error: { email: "Utilisateur introuvable" } };
  }

  const isValid = await verifyPassword(password, user.password_salt as string, user.password as string);

  if (!isValid) {
    return { success: false, error: { password: "Mot de passe incorrect" } };
  }

  const { password: _pw, password_salt: _salt, ...safeUser } = user;

  const token = await createLocalSession(safeUser as UserConnected);

  return { success: true, user: safeUser, token };
}

export async function updateUserController(id: string, data: Partial<UserConnected>) {
  try {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    const values = Object.values(data);

    const users = await getAllUser();
    const user = users.find((u) => u.id === id);

    if (!user) {
      return { success: false, error: "Utilisateur introuvable" };
    }

    const updated = { ...user, ...data };

    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify([updated]));

    const { password: _pw, password_salt: _salt, ...safeUser } = updated;

    await setLocalUser(safeUser as UserConnected);

    return { success: true, user: safeUser, message: "Utilisateur mis à jour avec succès" };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function getUserById(id: string) {
  const users = await getAllUser();
  const user = users.find((u) => u.id === id);

  return user as UserConnected;
}
export async function getUserId() { return await getLocalUser().then((u) => u?.id).catch(() => null) }