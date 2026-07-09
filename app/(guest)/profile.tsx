import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import { useAppTheme } from '@/contexts/themeContext';
import { useAppColors } from '@/hooks/useAppColors';
import { formatDateLong, getDayFixed, getDaysInMonthFromStartDay } from '@/utils/date.util';
import { Ionicons } from '@expo/vector-icons';
import { formatCompactNumber, toOrdinalFr } from '@/utils/number.util';
import { styles } from '@/styles/styles';
import { router } from 'expo-router';
import RenderImage from '@/components/modal/render-image';
import AnimatedHeader from '@/components/header/animate-header';
import HeaderProfile from '@/components/header/header-profile';
import { User, UserConnected } from '@/types/db';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { textColor, cardBg, border, sectionColor, labelColor, gradient } = useAppColors();
  const [avatar, setAvatar] = React.useState("");
  const [value, setValue] = React.useState<UserConnected | null>();
  const [visible, setVisible] = React.useState({
    show: false,
    value: avatar ?? require("@/assets/images/avatar.png"),
  });

  useEffect(() => {
    setAvatar(user?.avatar ?? require("@/assets/images/avatar.png"));
    setValue(user);
  }, [user])

  function onChangeAvatar(v: string) {
    setVisible({ show: false, value: v });
  }

  return (
    <AnimatedHeader
      maxHeight={300}
      minHeight={80}
      topTitle={false}
      header={(scrollY) => (
        <HeaderProfile
          scrollY={scrollY}
          avatar={avatar}
          title={value?.name}
          subtitle={value?.email}
          isback
        />
      )}
    >
      {value && <>
        <RenderImage value={visible.value} onChange={onChangeAvatar} visible={visible.show} />
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.metricLabel, { color: labelColor }]}>Budget mensuel</Text>
            <Text style={[styles.metricValue, { color: textColor }]}>
              {formatCompactNumber(Number(value?.budget_mensuel) ?? 0, value?.devise ?? 'MGA')}
            </Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.metricLabel, { color: labelColor }]}>Salaire mensuel</Text>
            <Text style={[styles.metricValue, { color: textColor }]}>
              {formatCompactNumber(Number(value?.salaire_mensuel) ?? 0, value?.devise ?? 'MGA')}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { width: "100%", backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.sectionTitle, { color: labelColor }]}>INFORMATIONS</Text>
          {[
            { icon: 'calendar-outline', label: 'Budget journalier', value: formatCompactNumber((Number(value?.budget_mensuel) / getDaysInMonthFromStartDay(getDayFixed(value?.date_debut as string))), value?.devise ?? 'MGA') },
            { icon: 'cash-outline', label: 'Devise', value: value?.devise ?? 'MGA' },
            { icon: 'calendar-number-outline', label: 'Début de cycle', value: `Le ${toOrdinalFr(getDayFixed(value?.date_debut as string))} de chaque mois.` },
            { icon: 'person-add-outline', label: 'Membre depuis', value: formatDateLong(value?.created_at as string) },
          ].map((item, i, arr) => (
            <View key={item.label} style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: border }]}>
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon as any} size={18} color={labelColor} />
                <Text style={[styles.rowLabel, { color: labelColor }]}>{item.label}</Text>
              </View>
              <Text style={[styles.rowValue, { color: textColor }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { width: "100%", backgroundColor: cardBg, borderColor: border }]}>
          {[
            { icon: 'create-outline', label: 'Modifier le profil', color: textColor, onPress: () => router.push('/edit-profile') },
            { icon: 'settings-outline', label: 'Paramètres budget', color: textColor, onPress: () => { } },
            { icon: 'log-out-outline', label: 'Se déconnecter', color: '#E24B4A', onPress: () => logout() },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={[styles.row, i < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: border }]}
            >
              <View style={styles.rowLeft}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <Text style={[styles.rowLabel, { color: item.color }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={labelColor} />
            </TouchableOpacity>
          ))}
        </View>
      </>}
    </AnimatedHeader>
  );
}
