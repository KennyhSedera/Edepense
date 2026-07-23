import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ToastAndroid } from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';
import Field from '../input/InputText';
import { updatePwd } from '@/controller/user.controller';

type Props = { visible: boolean; onClose: () => void };

export default function ChangePasswordModal({ visible, onClose }: Props) {
  const { textColor, cardBg, border, sectionColor, backgroundColor, inputBg } = useAppColors();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
  };

  const [error, setError] = useState<Record<string, string>>({});

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!currentPwd.trim()) {
      errors.currentPwd = 'Le mot de passe actuel est requis.';
    }
    if (!newPwd.trim()) {
      errors.newPwd = 'Le nouveau mot de passe est requis.';
    }
    if (!confirmPwd.trim()) {
      errors.confirmPwd = 'La confirmation du mot de passe est requise.';
    }
    if (currentPwd === newPwd) {
      errors.newPwd = 'Le nouveau mot de passe doit différer du mot de passe actuel.';
    }
    if (confirmPwd !== newPwd) {
      errors.confirmPwd = 'La confirmation du mot de passe doit correspondre au nouveau mot de passe.';
    }
    return errors;
  }

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await updatePwd(currentPwd, newPwd);

      if (!result.success) {
        setError(result.error || {});
        return;
      }

      ToastAndroid.show('Mot de passe mis à jour', ToastAndroid.SHORT);
      reset();
      onClose();
    } catch (e) {
      ToastAndroid.show('Erreur lors de la mise à jour', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
          <Text style={{ color: textColor, fontSize: 18, fontWeight: '600', marginBottom: 20 }}>
            Changer le mot de passe
          </Text>

          <Field
            placeholder="Mot de passe actuel"
            placeholderTextColor={border}
            secureTextEntry
            value={currentPwd}
            onChangeText={setCurrentPwd}
            error={error.currentPwd}
            onFocus={() => setError({ ...error, currentPwd: '' })}
          />
          <Field
            placeholder="Nouveau mot de passe"
            placeholderTextColor={border}
            secureTextEntry
            value={newPwd}
            onChangeText={setNewPwd}
            error={error.newPwd}
            onFocus={() => setError({ ...error, newPwd: '' })}
          />
          <Field
            placeholder="Confirmer le nouveau mot de passe"
            placeholderTextColor={border}
            secureTextEntry
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            error={error.confirmPwd}
            onFocus={() => setError({ ...error, confirmPwd: '' })}
          />

          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => { reset(); onClose(); }}
              style={{ flex: 1, padding: 14, alignItems: 'center', marginRight: 8, backgroundColor: inputBg, borderRadius: 10 }}
            >
              <Text style={{ color: textColor }}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{ flex: 1, padding: 14, alignItems: 'center', backgroundColor: sectionColor, borderRadius: 10 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {loading ? 'Mise à jour...' : 'Confirmer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}