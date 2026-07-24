import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUser, getUserById, getUserId } from '@/controller/user.controller';
import { STORAGE_USER_KEY } from '@/constants/storage';
import * as SecureStore from "expo-secure-store";

export type Currency = 'MGA' | 'EUR' | 'USD';
export type Language = 'fr' | 'mg';

const CURRENCY_KEY = (userId: string) => `pref_currency_${userId}`;
const LANGUAGE_KEY = (userId: string) => `pref_language_${userId}`;

export function useAppPreferences() {
  const [currency, setCurrency] = useState<Currency>('MGA');
  const [language, setLanguage] = useState<Language>('fr');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      if (!userId) return;

      const [curr, lang] = await Promise.all([
        AsyncStorage.getItem(CURRENCY_KEY(userId)),
        AsyncStorage.getItem(LANGUAGE_KEY(userId)),
      ]);

      if (curr) setCurrency(curr as Currency);
      if (lang) setLanguage(lang as Language);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateCurrency = useCallback(async (curr: Currency) => {
    const userId = await getUserId();
    if (!userId) return { ok: false, message: 'Utilisateur non connecté' };
    const users = await getAllUser();
    if (users.length === 0) return { ok: false, message: 'Aucun utilisateur' };
    const newUsers = users.map((u) => (u.id === userId ? { ...u, devise: curr } : u));

    const user = await getUserById(userId);

    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUsers));
    await AsyncStorage.setItem(CURRENCY_KEY(userId), curr);
    await SecureStore.setItemAsync("local_user", JSON.stringify({ ...user, devise: curr }));

    setCurrency(curr);

    return { ok: true, message: 'Devise mise à jour' };
  }, []);

  const updateLanguage = useCallback(async (lang: Language) => {
    const userId = await getUserId();
    if (!userId) return;
    await AsyncStorage.setItem(LANGUAGE_KEY(userId), lang);
    setLanguage(lang);
  }, []);

  return { loading, currency, language, updateCurrency, updateLanguage, reload: load };
}