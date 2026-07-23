import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { BIOMETRIC_KEY, LOCK_ENABLED_KEY, PIN_KEY } from '@/constants/storage';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export function useAppLock(userId?: string | null) {
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadState = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [pin, biometric, lockEnabled, hasHardware, isEnrolled] = await Promise.all([
        SecureStore.getItemAsync(PIN_KEY(userId)),
        SecureStore.getItemAsync(BIOMETRIC_KEY(userId)),
        SecureStore.getItemAsync(LOCK_ENABLED_KEY(userId)),
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);

      setIsPinSet(!!pin);
      setIsBiometricEnabled(biometric === 'true');
      setIsLockEnabled(lockEnabled === 'true');
      setIsBiometricAvailable(hasHardware && isEnrolled);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadState(); }, [loadState]);

  const setupPin = useCallback(async (pin: string) => {
    if (!userId) return false;
    const hashed = await hashPin(pin);
    await SecureStore.setItemAsync(PIN_KEY(userId), hashed);
    await SecureStore.setItemAsync(LOCK_ENABLED_KEY(userId), 'true');
    setIsPinSet(true);
    setIsLockEnabled(true);
    return true;
  }, [userId]);

  const verifyPin = useCallback(async (pin: string) => {
    if (!userId) return false;
    const stored = await SecureStore.getItemAsync(PIN_KEY(userId));
    if (!stored) return false;
    const hashed = await hashPin(pin);
    return stored === hashed;
  }, [userId]);

  const removePin = useCallback(async () => {
    if (!userId) return;
    await SecureStore.deleteItemAsync(PIN_KEY(userId));
    await SecureStore.setItemAsync(BIOMETRIC_KEY(userId), 'false');
    await SecureStore.setItemAsync(LOCK_ENABLED_KEY(userId), 'false');
    setIsPinSet(false);
    setIsBiometricEnabled(false);
    setIsLockEnabled(false);
  }, [userId]);

  const toggleLock = useCallback(async (value: boolean) => {
    if (!userId) return;
    await SecureStore.setItemAsync(LOCK_ENABLED_KEY(userId), value ? 'true' : 'false');
    setIsLockEnabled(value);
    if (!value) {
      await SecureStore.setItemAsync(BIOMETRIC_KEY(userId), 'false');
      setIsBiometricEnabled(false);
    }
  }, [userId]);

  const toggleBiometric = useCallback(async (value: boolean) => {
    if (!userId) return;
    await SecureStore.setItemAsync(BIOMETRIC_KEY(userId), value ? 'true' : 'false');
    setIsBiometricEnabled(value);
  }, [userId]);

  const authenticateWithBiometric = useCallback(async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Déverrouiller E-Dépense',
      cancelLabel: 'Utiliser le code PIN',
      disableDeviceFallback: true,
    });
    return result.success;
  }, []);

  const changePin = useCallback(async (newPin: string) => {
    if (!userId) return false;
    const hashed = await hashPin(newPin);
    await SecureStore.setItemAsync(PIN_KEY(userId), hashed);
    setIsPinSet(true);
    return true;
  }, [userId]);

  return {
    loading, isLockEnabled, isPinSet, isBiometricEnabled, isBiometricAvailable,
    setupPin, verifyPin, removePin, toggleLock, toggleBiometric,
    authenticateWithBiometric, reload: loadState, changePin,
  };
}