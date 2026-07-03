import React, { } from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import { useAppTheme } from '@/hooks/themeContext';
import { useAppColors } from '@/hooks/useAppColors';
import { formatDateLong, getDayFixed, getDaysInMonthFromStartDay } from '@/utils/dateFormat';
import { Ionicons } from '@expo/vector-icons';
import { formatCompactNumber } from '@/utils/numberFormat';
import { styles } from '@/styles/styles';
import { router } from 'expo-router';
import RenderImage from '@/components/ui/render-image';
import AnimatedHeader from '@/components/animate-header';
import HeaderProfile from '@/components/ui/header-profile';

export default function ProfileScreen() {
  const { user } = useAppTheme();
  const { textColor, cardBg, border, sectionColor, labelColor, gradient } = useAppColors();
  const [avatar, setAvatar] = React.useState(user?.avatar ?? "");
  const [loading, setLoading] = React.useState(false);
  const [visible, setVisible] = React.useState({
    show: false,
    value: avatar ?? require("@/assets/images/avatar.png"),
  });

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'KS';

  function onChangeAvatar(v: string) {
    setVisible({ show: false, value: v });
  }

  return (
    <AnimatedHeader
      maxHeight={300}
      minHeight={80}
      header={(scrollY) => (
        <HeaderProfile
          scrollY={scrollY}
          avatar={avatar}
          children={<View style={[styles.badge, { marginTop: 10 }]}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Compte actif</Text>
          </View>}
          title={user?.name}
          subtitle={user?.email}
        />
      )}
    >
      <RenderImage value={visible.value} onChange={onChangeAvatar} visible={visible.show} />
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.metricLabel, { color: labelColor }]}>Budget mensuel</Text>
          <Text style={[styles.metricValue, { color: textColor }]}>
            {formatCompactNumber(Number(user?.budget_mensuel) ?? 0, user?.devise ?? 'MGA')}
          </Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.metricLabel, { color: labelColor }]}>Salaire mensuel</Text>
          <Text style={[styles.metricValue, { color: textColor }]}>
            {formatCompactNumber(Number(user?.salaire_mensuel) ?? 0, user?.devise ?? 'MGA')}
          </Text>
        </View>
      </View>

      <View style={[styles.card, { width: "100%", backgroundColor: cardBg, borderColor: border }]}>
        <Text style={[styles.sectionTitle, { color: labelColor }]}>INFORMATIONS</Text>
        {[
          { icon: 'calendar-outline', label: 'Budget journalier', value: formatCompactNumber((Number(user?.budget_mensuel) / getDaysInMonthFromStartDay(getDayFixed(user?.date_debut as string))), user?.devise ?? 'MGA') },
          { icon: 'cash-outline', label: 'Devise', value: user?.devise ?? 'MGA' },
          { icon: 'calendar-number-outline', label: 'Début de cycle', value: `Le ${getDayFixed(user?.date_debut as string)} de chaque moistyles.` },
          { icon: 'person-add-outline', label: 'Membre depuis', value: formatDateLong(user?.created_at as string) },
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
          { icon: 'log-out-outline', label: 'Se déconnecter', color: '#E24B4A', onPress: () => { } },
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

    </AnimatedHeader>
  );
}
