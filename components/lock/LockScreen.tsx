import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAppLock } from '@/hooks/useAppLock';
import { useAppColors } from '@/hooks/useAppColors';
import PinModal from './PinModal';
import { router } from 'expo-router';

type Props = {
  userId: string;
  onUnlock: () => void;
  onAuthenticatingChange?: (isAuthenticating: boolean) => void;
  theme?: 'light' | 'dark';
};

export default function LockScreen({ userId, onUnlock, onAuthenticatingChange, theme }: Props) {
  const { isBiometricEnabled, verifyPin, authenticateWithBiometric } = useAppLock(userId);
  const { backgroundColor } = useAppColors(theme);
  const [triedBiometric, setTriedBiometric] = useState(false);

  useEffect(() => {
    if (isBiometricEnabled && !triedBiometric) {
      setTriedBiometric(true);
      onAuthenticatingChange?.(true);

      authenticateWithBiometric()
        .then((success) => {
          if (success) onUnlock();
        })
        .finally(() => {
          onAuthenticatingChange?.(false);
        });
    }
  }, [isBiometricEnabled]);

  async function handlePinSubmit(pin: string) {
    const ok = await verifyPin(pin);
    if (ok) onUnlock();
    return ok;
  }

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <PinModal
        theme={theme}
        visible={true}
        mode="verify"
        title="Entrez votre code pour continuer"
        hideCancel
        onSubmit={handlePinSubmit}
        onClose={() => { }}
      />
    </View>
  );
}