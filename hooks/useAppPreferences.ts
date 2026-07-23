import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserId } from '@/controller/user.controller';

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
    if (!userId) return;
    await AsyncStorage.setItem(CURRENCY_KEY(userId), curr);
    setCurrency(curr);
  }, []);

  const updateLanguage = useCallback(async (lang: Language) => {
    const userId = await getUserId();
    if (!userId) return;
    await AsyncStorage.setItem(LANGUAGE_KEY(userId), lang);
    setLanguage(lang);
  }, []);

  return { loading, currency, language, updateCurrency, updateLanguage, reload: load };
}