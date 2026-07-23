import { View, Text, TouchableOpacity, Linking, Pressable } from 'react-native'
import React, { useState } from 'react'
import { HeaderWithSearch } from './_layout'
import { MainHeader } from '@/components/header/header-main'
import { useHours } from '@/hooks/useHour';
import { useAppColors } from '@/hooks/useAppColors';
import { styles as style } from "@/styles/styles";
import Toggle from '@/components/input/Toggle';
import { useAppLock } from '@/hooks/useAppLock';
import PinModal from '@/components/lock/PinModal';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChangePasswordModal from '@/components/settings/ChangePasswordModal';
import DeleteModal from '@/components/modal/DeleteModal';
import { removeUser } from '@/controller/user.controller';
import { useAppTheme } from '@/contexts/themeContext';
import { useAppPreferences } from '@/hooks/useAppPreferences';
import ModalConfirm from '@/components/modal/modal-confirm';
import { Bell, Info, Lock, Settings, User } from 'lucide-react-native';

export default function SettingScreen() {
  const { textColor, backgroundColor, border, cardBg, sectionColor, labelColor, dangerColor, white } = useAppColors();
  const { theme, setThemeMode } = useAppTheme();
  const { currency, language, updateCurrency, updateLanguage } = useAppPreferences();
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const {
    hour,
    enabled,
    disableNotifications,
    enableNotifications,
    handleHourChange
  } = useHours();

  const { user, logout } = useAuth();

  const {
    isLockEnabled, isPinSet, isBiometricEnabled, isBiometricAvailable,
    setupPin, verifyPin, removePin, toggleBiometric, changePin,
  } = useAppLock(user?.id);

  const [changePinModalVisible, setChangePinModalVisible] = useState(false);

  const handleToggle = async (value: boolean) => {
    value ? await enableNotifications() : await disableNotifications();
  }

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'create' | 'verify'>('create');

  const appVersion = '1.0.0';

  const handleLockToggle = (value: boolean) => {
    console.log(value, isPinSet);

    if (value && !isPinSet) {
      setPinModalMode('create');
      setPinModalVisible(true);
    } else if (!value) {
      setPinModalMode('verify');
      setPinModalVisible(true);
    }
  };

  const handlePinSubmit = async (pin: string) => {
    if (pinModalMode === 'create') {
      await setupPin(pin);
      return true;
    }
    const ok = await verifyPin(pin);
    if (ok) await removePin();
    return ok;
  };

  const handleLogout = (action: string) => {
    action === "confirm" ? logout() : setLogoutVisible(false);
  }

  const handleDeleteAccount = async (action?: string, id?: string) => {
    if (action === 'delete' && id) {
      setDeleteModalVisible(false);
      await removeUser(id);
      await logout();
      router.replace('/login');
    }
    setDeleteModalVisible(false);
  };

  const SettingItem = ({ icon, label, onPress, danger = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: border,
      }}
    >
      <Ionicons name={icon} size={20} color={danger ? dangerColor : textColor} style={{ marginRight: 12 }} />
      <Text style={{ color: danger ? dangerColor : textColor, fontSize: 15, flex: 1 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={labelColor} />
    </TouchableOpacity>
  );

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Paramètres" />}
    >

      {/* Notifications */}
      <Text style={[style.sectionTitle, { color: labelColor, marginTop: 10, fontSize: 16, marginLeft: 5, borderBottomWidth: 0 }]}>
        <Bell size={14} color={labelColor} /> Notification
      </Text>
      <View style={{ padding: 10, borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1, marginBottom: 10 }}>
        <View style={[style.rowSpacing, enabled && { marginBottom: 15 }]}>
          <Ionicons name="calendar-number" size={20} color={textColor} style={{ marginRight: 12 }} />
          <Text style={{ color: textColor, fontSize: 15, flex: 1 }}>Rappel quotidien</Text>
          <Toggle value={enabled} onChange={handleToggle} />
        </View>

        {enabled && (
          <View style={[style.chipsWrap]}>
            {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => handleHourChange(h)}
                style={{
                  width: "18%",
                  padding: 8,
                  alignItems: "center",
                  borderRadius: 8,
                  backgroundColor: hour === h ? sectionColor : backgroundColor,
                }}
              >
                <Text style={{ color: hour === h ? white : textColor }}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Vérouillage de l'app */}
      <Text style={[style.sectionTitle, { color: labelColor, marginTop: 10, fontSize: 16, marginLeft: 5, borderBottomWidth: 0 }]}>
        <Lock size={14} color={labelColor} /> Securité
      </Text>
      <View style={{ padding: 10, borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1, marginBottom: 10 }}>

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
          <Ionicons name="lock-closed" size={20} color={textColor} style={{ marginRight: 12 }} />
          <Text style={{ color: textColor, fontSize: 15, flex: 1 }}>Verrouillage de l'app</Text>
          <Toggle value={isLockEnabled} onChange={handleLockToggle} />
        </View>

        {isLockEnabled && isBiometricAvailable && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: border, borderBottomWidth: 1, borderBottomColor: border }}>
            <Ionicons name="finger-print" size={20} color={textColor} style={{ marginRight: 12 }} />
            <Text style={{ color: textColor, fontSize: 15, flex: 1 }}>Déverrouillage biométrique</Text>
            <Toggle value={isBiometricEnabled} onChange={toggleBiometric} />
          </View>
        )}

        {isLockEnabled && isPinSet && (
          <Pressable onPress={() => setChangePinModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
            <Ionicons name="key" size={20} color={textColor} style={{ marginRight: 12 }} />
            <Text style={{ color: textColor, fontSize: 15, flex: 1 }}>Changer le code PIN</Text>
          </Pressable>
        )}

      </View>

      {/* Section Compte */}
      <Text style={[style.sectionTitle, { color: labelColor, marginTop: 10, fontSize: 16, marginLeft: 5, borderBottomWidth: 0 }]}>
        <User size={14} color={labelColor} /> Compte
      </Text>
      <View style={{ borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1, paddingHorizontal: 12, marginBottom: 10 }}>
        <SettingItem icon="person-outline" label="Modifier le profil" onPress={() => router.push('/edit-profile')} />
        <SettingItem icon="lock-closed-outline" label="Changer le mot de passe" onPress={() => setPwdModalVisible(true)} />
        <SettingItem icon="log-out-outline" label="Déconnexion" onPress={() => setLogoutVisible(true)} />
        <TouchableOpacity
          onPress={() => setDeleteModalVisible(true)}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
        >
          <Ionicons name="trash-outline" size={20} color={dangerColor} style={{ marginRight: 12 }} />
          <Text style={{ color: dangerColor, fontSize: 15 }}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>

      <Text style={[style.sectionTitle, { color: labelColor, marginTop: 10, fontSize: 16, marginLeft: 5, borderBottomWidth: 0 }]}>
        <Settings size={14} color={labelColor} /> Préférences d'affichage
      </Text>
      <View style={{ borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1, padding: 12, marginBottom: 10 }}>

        {/* Thème */}
        <Text style={{ color: labelColor, fontSize: 13, marginBottom: 8 }}>Thème</Text>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          {(['light', 'dark'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setThemeMode(mode)}
              style={{
                flex: 1, padding: 10, marginRight: mode === 'light' ? 8 : 0,
                borderRadius: 8, alignItems: 'center',
                backgroundColor: theme === mode ? sectionColor : backgroundColor,
                borderWidth: 1, borderColor: border,
              }}
            >
              <Text style={{ color: theme === mode ? white : textColor, fontSize: 13 }}>
                {mode === 'light' ? 'Clair' : 'Sombre'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Devise */}
        <Text style={{ color: labelColor, fontSize: 13, marginBottom: 8 }}>Devise</Text>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          {(['MGA', 'EUR', 'USD'] as const).map((curr) => (
            <TouchableOpacity
              key={curr}
              onPress={() => updateCurrency(curr)}
              style={{
                flex: 1, padding: 10, marginRight: curr !== 'USD' ? 8 : 0,
                borderRadius: 8, alignItems: 'center',
                backgroundColor: currency === curr ? sectionColor : backgroundColor,
                borderWidth: 1, borderColor: border,
              }}
            >
              <Text style={{ color: currency === curr ? white : textColor, fontSize: 13 }}>{curr}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Langue */}
        <Text style={{ color: labelColor, fontSize: 13, marginBottom: 8 }}>Langue</Text>
        <View style={{ flexDirection: 'row' }}>
          {(['fr'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => updateLanguage(lang)}
              style={{
                flex: 1, padding: 10, marginRight: 8,
                borderRadius: 8, alignItems: 'center',
                backgroundColor: language === lang ? sectionColor : backgroundColor,
                borderWidth: 1, borderColor: border,
              }}
            >
              <Text style={{ color: language === lang ? white : textColor, fontSize: 13 }}>
                {lang === 'fr' ? 'Français' : 'Malagasy'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[style.sectionTitle, { color: labelColor, marginTop: 10, fontSize: 16, marginLeft: 5, borderBottomWidth: 0 }]}>
        <Info size={16} color={labelColor} /> Support / Infos
      </Text>
      <View style={{ borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1, paddingHorizontal: 12, marginBottom: 20 }}>
        <SettingItem icon="help-circle-outline" label="Aide / FAQ" onPress={() => router.push('/faq')} />
        <SettingItem
          icon="mail-outline"
          label="Contact / Feedback"
          onPress={() => Linking.openURL('mailto:kennyhsedera@gmail.com?subject=Feedback E-Dépense')}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
          <Ionicons name="information-circle-outline" size={20} color={textColor} style={{ marginRight: 12 }} />
          <Text style={{ color: textColor, fontSize: 15, flex: 1 }}>Version</Text>
          <Text style={{ color: labelColor, fontSize: 14 }}>{appVersion}</Text>
        </View>
      </View>

      <PinModal
        visible={pinModalVisible}
        mode={pinModalMode}
        onSubmit={handlePinSubmit}
        onClose={() => setPinModalVisible(false)}
      />

      <PinModal
        visible={changePinModalVisible}
        mode="change"
        onSubmit={verifyPin}
        onSubmitNew={changePin}
        onClose={() => setChangePinModalVisible(false)}
      />

      <ChangePasswordModal visible={pwdModalVisible} onClose={() => setPwdModalVisible(false)} />

      <DeleteModal
        id={user?.id}
        visible={deleteModalVisible}
        onChange={handleDeleteAccount}
        message="Cette action est irréversible. Toutes vos données (dépenses, budgets, provisions) seront définitivement supprimées."
      />

      <ModalConfirm
        visible={logoutVisible} onChange={handleLogout} message="Voulez-vous vraiment vous déconnecter ?" title="Déconnexion ?" buttonText="Se déconnecter" />
    </MainHeader>
  )
}