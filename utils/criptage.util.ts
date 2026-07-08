import * as Crypto from "expo-crypto";

export const hashPassword = async (password: string, salt?: string) => {
  const usedSalt = salt ?? Crypto.randomUUID();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + usedSalt
  );
  return { hash, salt: usedSalt };
};

export const verifyPassword = async (password: string, salt: string, storedHash: string) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return hash === storedHash;
};