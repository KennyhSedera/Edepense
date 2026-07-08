import { db } from "@/sqlite/db";
import { User, UserConnected } from "@/types/db";
import { verifyPassword } from "@/utils/criptage.util";
import { createLocalSession, setLocalUser } from "@/utils/token.util";

export const login = async (email: string, password: string) => {
  const user = db.getFirstSync<User>(
    `SELECT * FROM users WHERE email = ?;`,
    [email]
  );

  if (!user) {
    return { success: false, error: "Utilisateur introuvable" };
  }

  const isValid = await verifyPassword(password, user.password_salt as string, user.password as string);

  if (!isValid) {
    return { success: false, error: "Mot de passe incorrect" };
  }

  const { password: _pw, password_salt: _salt, ...safeUser } = user;

  await createLocalSession(safeUser as UserConnected);

  return { success: true, user: safeUser };
};

export async function updateUserController(id: string, data: Partial<UserConnected>) {
  try {
    const fields = Object.keys(data).map((k) => `${k} = ?`).join(", ");
    const values = Object.values(data);

    db.runSync(
      `UPDATE users SET ${fields}, updated_at = ? WHERE id = ?;`,
      [...values, new Date().toISOString(), id]
    );

    const updated = db.getFirstSync<UserConnected>(`SELECT * FROM users WHERE id = ?;`, [id]);

    if (!updated) {
      return { success: false, error: "Utilisateur introuvable après mise à jour" };
    }

    await setLocalUser(updated);

    return { success: true, user: updated };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}