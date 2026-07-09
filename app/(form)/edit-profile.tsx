import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  Alert, ToastAndroid, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAppColors } from '@/hooks/useAppColors';
import { styles } from '@/styles/styles';
import Field from '@/components/input/InputText';
import { getDaysInMonthFromStartDay } from '@/utils/date.util';
import { getDayFixed } from '../../utils/date.util';
import AnimatedHeader from '@/components/header/animate-header';
import HeaderProfile from '@/components/header/header-profile';
import ImagePikerModal from '@/components/modal/ImagePikerModal';
import SelectChips from '@/components/input/select-chips';
import { useAuth } from '@/contexts/AuthContext';

const DEVISES = ['MGA', 'EUR', 'USD', 'GBP'];

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const { textColor, cardBg, border, sectionColor, labelColor } = useAppColors();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [budgetMensuel, setBudgetMensuel] = useState(String(user?.budget_mensuel ?? ''));
  const [salaireMensuel, setSalaireMensuel] = useState(String(user?.salaire_mensuel ?? ''));
  const [devise, setDevise] = useState(user?.devise ?? 'MGA');
  const [dateDebut, setDateDebut] = useState(String(getDayFixed(user?.date_debut as string)) ?? '');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const budgetJournalier = dateDebut && budgetMensuel
    ? (Number(budgetMensuel) / getDaysInMonthFromStartDay(Number(dateDebut))).toFixed(0)
    : user?.budget_journalier ?? 0;

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Le nom est requis.';
    }
    if (!budgetMensuel || isNaN(Number(budgetMensuel))) {
      errors.budgetMensuel = 'Le budget mensuel doit être un nombre valide.';
    }
    if (!salaireMensuel || isNaN(Number(salaireMensuel))) {
      errors.salaireMensuel = 'Le salaire mensuel doit être un nombre valide.';
    }
    if (!email.trim()) {
      errors.email = 'L\'email est requis.';
    }

    return errors;
  }

  const handleSave = async () => {
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const updated = {
        ...user!,
        name: name.trim(),
        email: email.trim(),
        budget_mensuel: Number(budgetMensuel),
        salaire_mensuel: Number(salaireMensuel),
        budget_journalier: Number(budgetJournalier),
        devise,
        date_debut: String(dateDebut),
        updated_at: new Date().toISOString(),
      };

      const res = await updateUser(updated);

      if (res.success) {
        ToastAndroid.show(res.message as string, ToastAndroid.SHORT);
        router.back();
      } else {
        Alert.alert('Erreur', res.error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  async function onChangeAvatar(v: string) {
    if (!user) return;
    setAvatar(v);
    await updateUser({ ...user, avatar: v } as Parameters<typeof updateUser>[0]);
    setVisible(false);
  }

  function handleSetVisible() {
    setVisible(true);
  }

  return (
    <AnimatedHeader
      maxHeight={270}
      minHeight={90}
      marginBottomMax={90}
      marginBottomMin={0}
      topTitle={false}
      header={(scrollY) => (
        <HeaderProfile
          scrollY={scrollY}
          avatar={avatar}
          action={handleSetVisible}
          title="Modification de mon profil"
          subtitle=""
          isback
        />
      )}
    >
      <ImagePikerModal value={avatar} onChange={onChangeAvatar} visible={visible} />
      <View style={[styles.form, { backgroundColor: cardBg, borderColor: border, borderWidth: 0.5 }]}>
        <Text style={[styles.sectionTitle, { color: labelColor, borderBottomColor: border }]}>
          INFORMATIONS PERSONNELLES
        </Text>

        <Field
          label="Nom complet"
          value={name}
          onChangeText={setName}
          placeholder="Ex: Kennyh Sedera"
          error={errors.name}
          onFocus={() => setErrors({ ...errors, name: '' })}
        />

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Ex: kennyh@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          onFocus={() => setErrors({ ...errors, email: '' })}
        />
      </View>

      <View style={[styles.form, { backgroundColor: cardBg, borderColor: border, borderWidth: 0.5 }]}>
        <Text style={[styles.sectionTitle, { color: labelColor, borderBottomColor: border }]}>
          BUDGET
        </Text>

        <Field
          label="Salaire mensuel"
          value={salaireMensuel}
          onChangeText={setSalaireMensuel}
          placeholder="Ex: 1200000"
          keyboardType="numeric"
          error={errors.salaireMensuel}
          onFocus={() => setErrors({ ...errors, salaireMensuel: '' })}
        />

        <Field
          label="Budget mensuel"
          value={budgetMensuel}
          onChangeText={setBudgetMensuel}
          placeholder="Ex: 500000"
          keyboardType="numeric"
          error={errors.budgetMensuel}
          onFocus={() => setErrors({ ...errors, budgetMensuel: '' })}
        />

        {/* Budget journalier calculé automatiquement */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: labelColor }]}>Budget journalier (calculé)</Text>
          <View style={[styles.input, { backgroundColor: border + '33', borderColor: border }]}>
            <Text style={[styles.text, { color: textColor }]}>
              {Number(budgetJournalier).toLocaleString('fr-MG')} {devise}
            </Text>
          </View>
        </View>

        <SelectChips
          value={devise}
          setValue={setDevise}
          data={DEVISES}
          label="Devise"
        />

        <SelectChips
          value={dateDebut}
          setValue={setDateDebut}
          data={["1", "5", "10", "15", "20", "25"]}
          label="Jour de début de cycle"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: sectionColor, opacity: loading ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Enregistrer</Text>
        }
      </TouchableOpacity>

    </AnimatedHeader>
  );
}