import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  Alert, ToastAndroid, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAppColors } from '@/hooks/useAppColors';
import { useAppTheme } from '@/hooks/themeContext';
import { styles } from '@/styles/styles';
import Field from '@/components/ui/InputText';
import { getDaysInMonthFromStartDay } from '@/utils/dateFormat';
import { updateUser } from '@/controller/user';
import { getDayFixed } from '../../utils/dateFormat';
import AnimatedHeader from '@/components/animate-header';
import HeaderProfile from '@/components/ui/header-profile';
import ImagePikerModal from '@/components/ui/ImagePikerModal';
import SelectChips from '@/components/ui/select-chips';

const DEVISES = ['MGA', 'EUR', 'USD', 'GBP'];

export default function EditProfileScreen() {
  const { user, loadUser } = useAppTheme();
  const { textColor, cardBg, border, sectionColor, labelColor, backgroundColor } = useAppColors();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [budgetMensuel, setBudgetMensuel] = useState(String(user?.budget_mensuel ?? ''));
  const [salaireMensuel, setSalaireMensuel] = useState(String(user?.salaire_mensuel ?? ''));
  const [devise, setDevise] = useState(user?.devise ?? 'MGA');
  const [dateDebut, setDateDebut] = useState(String(getDayFixed(user?.date_debut as string)) ?? '');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar);

  const budgetJournalier = dateDebut && budgetMensuel
    ? (Number(budgetMensuel) / getDaysInMonthFromStartDay(Number(dateDebut))).toFixed(0)
    : user?.budget_journalier ?? 0;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis.');
      return;
    }
    if (!budgetMensuel || isNaN(Number(budgetMensuel))) {
      Alert.alert('Erreur', 'Le budget mensuel doit être un nombre valide.');
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
      const json = JSON.parse(res);

      if (json.success) {
        ToastAndroid.show(json.message, ToastAndroid.SHORT);
        await loadUser();
        router.back();
      } else {
        Alert.alert('Erreur', json.message);
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
    await loadUser();
    setVisible(false);
  }

  function handleSetVisible() {
    setVisible(true);
  }

  return (
    <AnimatedHeader
      maxHeight={280}
      minHeight={80}
      header={(scrollY) => (
        <HeaderProfile
          scrollY={scrollY}
          avatar={avatar}
          action={handleSetVisible}
          title="Modifier mon profil"
          subtitle="Informations personnelles"
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
        />

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Ex: kennyh@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
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
        />

        <Field
          label="Budget mensuel"
          value={budgetMensuel}
          onChangeText={setBudgetMensuel}
          placeholder="Ex: 500000"
          keyboardType="numeric"
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