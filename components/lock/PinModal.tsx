import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';

type Props = {
  visible: boolean;
  mode: 'create' | 'verify' | 'change';
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean> | boolean;
  onSubmitNew?: (pin: string) => Promise<boolean> | boolean;
  title?: string;
  hideCancel?: boolean;
  theme?: 'light' | 'dark';
};

export default function PinModal({ visible, mode, onClose, onSubmit, onSubmitNew, title, hideCancel, theme }: Props) {
  const { textColor, cardBg, border, sectionColor } = useAppColors(theme);
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [oldPinVerified, setOldPinVerified] = useState(false);

  const reset = () => {
    setPin('');
    setFirstPin(null);
    setStep('enter');
    setOldPinVerified(false);
  };

  const handleDigit = async (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length !== 4) return;

    if (mode === 'change' && !oldPinVerified) {
      const ok = await onSubmit(newPin);
      setPin('');
      if (ok) {
        setOldPinVerified(true);
      } else {
        ToastAndroid.show('Code actuel incorrect', ToastAndroid.SHORT);
      }
      return;
    }

    if (mode === 'create' || (mode === 'change' && oldPinVerified)) {
      if (step === 'enter') {
        setFirstPin(newPin);
        setStep('confirm');
        setPin('');
        return;
      }

      if (newPin === firstPin) {
        const submitFn = mode === 'change' ? onSubmitNew! : onSubmit;
        await submitFn(newPin);
        reset();
        onClose();
      } else {
        ToastAndroid.show('Les codes ne correspondent pas', ToastAndroid.SHORT);
        reset();
      }
      return;
    }

    const ok = await onSubmit(newPin);
    setPin('');
    if (ok) {
      reset();
      onClose();
    } else {
      ToastAndroid.show('Code incorrect', ToastAndroid.SHORT);
    }
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  const getTitle = () => {
    if (title) return title;
    if (mode === 'change') {
      if (!oldPinVerified) return 'Entrez votre code actuel';
      return step === 'enter' ? 'Créez votre nouveau code' : 'Confirmez le nouveau code';
    }
    if (mode === 'create') {
      return step === 'enter' ? 'Créez votre code PIN' : 'Confirmez votre code PIN';
    }
    return 'Entrez votre code PIN';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '85%', backgroundColor: cardBg, borderRadius: 16, padding: 20, alignItems: 'center' }}>
          <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 20 }}>
            {getTitle()}
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 25 }}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  width: 14, height: 14, borderRadius: 7, marginHorizontal: 8,
                  backgroundColor: i < pin.length ? sectionColor : 'transparent',
                  borderWidth: 1, borderColor: `${textColor}aa`,
                }}
              />
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 240, justifyContent: 'center' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, idx) => (
              <TouchableOpacity
                key={idx}
                disabled={k === ''}
                onPress={() => (k === '⌫' ? handleDelete() : k !== '' && handleDigit(k))}
                style={{ width: 80, height: 60, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ color: textColor, fontSize: 20 }}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {!hideCancel && (
            <TouchableOpacity onPress={() => { reset(); onClose(); }} style={{ marginTop: 15 }}>
              <Text style={{ color: sectionColor }}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}