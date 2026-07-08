import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  Alert, ToastAndroid, ActivityIndicator,
} from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { styles } from '@/styles/styles';
import Field from '@/components/ui/InputText';
import { setUser } from '@/controller/user.controller';
import AnimatedHeader from '@/components/header/animate-header';
import HeaderProfile from '@/components/header/header-profile';
import ImagePikerModal from '@/components/ui/ImagePikerModal';
import SelectChips from '@/components/ui/select-chips';
import * as Crypto from "expo-crypto";
import { hashPassword } from '@/utils/criptage.util';
import { useAuth } from '@/contexts/AuthContext';

const DEVISES = ['MGA', 'EUR', 'USD', 'GBP'];

export default function RegisterScreen() {
  const { textColor, cardBg, border, sectionColor, labelColor } = useAppColors();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [budgetMensuel, setBudgetMensuel] = useState(String(''));
  const [salaireMensuel, setSalaireMensuel] = useState(String(''));
  const [devise, setDevise] = useState('MGA');
  const [dateDebut, setDateDebut] = useState('1');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!password.trim()) {
      errors.password = 'Le mot de passe est requis.';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit avoir au moins 6 caractères.';
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
      const salt = Crypto.randomUUID();
      const { hash } = await hashPassword(password, salt);
      const data = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        budget_mensuel: Number(budgetMensuel),
        salaire_mensuel: Number(salaireMensuel),
        budget_journalier: Number(salaireMensuel) / 30,
        devise,
        date_debut: String(dateDebut),
        password: hash,
        password_salt: salt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar
      };

      const res = await setUser(data);
      const json = JSON.parse(res);

      if (json.success) {
        ToastAndroid.show(json.message, ToastAndroid.SHORT);
        setTimeout(async () => {
          const result = await login(email, password);
          if (!result.success) {
            setErrors(result.error as Record<string, string>);
            return;
          }
        }, 1000);
      } else {
        setErrors(json.error as Record<string, string>);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  async function onChangeAvatar(v: string) {
    setAvatar(v as string);
    setVisible(false);
  }

  function handleSetVisible() {
    setVisible(true);
  }

  return (
    <AnimatedHeader
      maxHeight={300}
      minHeight={85}
      header={(scrollY) => (
        <HeaderProfile
          scrollY={scrollY}
          avatar={avatar}
          action={handleSetVisible}
          title="Nouveau compte"
          subtitle="Informations personnelles"
          isback={false}
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
          onFocus={() => setErrors({ ...errors, name: "" })}
        />

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Ex: kennyh@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          onFocus={() => setErrors({ ...errors, email: "" })}
        />

        <Field
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry={true}
          autoCapitalize="none"
          error={errors.password}
          onFocus={() => setErrors({ ...errors, password: "" })}
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
          onFocus={() => setErrors({ ...errors, salaireMensuel: "" })}
        />

        <Field
          label="Budget mensuel"
          value={budgetMensuel}
          onChangeText={setBudgetMensuel}
          placeholder="Ex: 500000"
          keyboardType="numeric"
          error={errors.budgetMensuel}
          onFocus={() => setErrors({ ...errors, budgetMensuel: "" })}
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: labelColor }]}>Budget journalier (calculé)</Text>
          <View style={[styles.input, { backgroundColor: border + '33', borderColor: border }]}>
            <Text style={[styles.text, { color: textColor }]}>
              {Math.round(Number(budgetMensuel) / 30).toLocaleString('fr-MG')} {devise}
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