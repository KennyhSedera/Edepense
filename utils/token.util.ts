import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { UserConnected } from "@/types/db";

export const setLocalToken = async (token: string) => {
  await SecureStore.setItemAsync("local_token", token);
};

export const getLocalToken = async () => {
  return await SecureStore.getItemAsync("local_token");
};

export const removeLocalToken = async () => {
  await SecureStore.deleteItemAsync("local_token");
  await SecureStore.deleteItemAsync("local_token_expiry");
  await SecureStore.deleteItemAsync("local_user");
};

export const createLocalSession = async (
  user: UserConnected,
  durationMs: number = 7 * 24 * 60 * 60 * 1000
) => {
  const token = Crypto.randomUUID();
  const expiresAt = Date.now() + durationMs;

  await SecureStore.setItemAsync("local_token", token);
  await SecureStore.setItemAsync("local_token_expiry", expiresAt.toString());
  await SecureStore.setItemAsync("local_user", JSON.stringify(user));

  return token;
};

export const setLocalUser = async (user: UserConnected) => {
  await SecureStore.setItemAsync("local_user", JSON.stringify(user));
};

export const getLocalUser = async (): Promise<UserConnected | null> => {
  const raw = await SecureStore.getItemAsync("local_user");
  return raw ? JSON.parse(raw) : null;
};

export const isLoggedIn = async () => {
  const token = await SecureStore.getItemAsync("local_token");
  const expiryStr = await SecureStore.getItemAsync("local_token_expiry");

  if (!token || !expiryStr) return false;

  const expiry = parseInt(expiryStr, 10);
  if (Date.now() > expiry) {
    await removeLocalToken();
    return false;
  }

  return true;
};