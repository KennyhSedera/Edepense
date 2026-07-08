import { View, Text, ScrollView, Image, ActivityIndicator, Pressable, Alert, ToastAndroid } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFocusEffect, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { getGoalById, deleteGoal } from '@/controller/goal.controller';
import { Goal } from '@/types/db';
import { useAppColors } from '@/hooks/useAppColors';
import { styles } from '@/styles/styles';
import { getGoalType } from '@/constants/type';
import { formatMoney } from '@/utils/number.util';
import { formatDateLong, toISODate } from '@/utils/date.util';
import { goalCoverImage } from '@/constants/image';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react-native';
import MenuButton, { MenuItem } from '@/components/ui/MenuButton';
import DeleteModal from '@/components/ui/DeleteModal';
import RenderImage from '@/components/ui/render-image';
import { MainHeader } from '@/components/header/header-main';
import { DetailHeader } from './_layout';

export default function DetailBudget() {
  const { id }: { id: string } = useLocalSearchParams();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal>();
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { backgroundColor, textColor, dangerColor, cardBg, border, sectionColor } = useAppColors();
  const [showImage, setShowImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getGoalById(id);
      setGoal(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleEdit() {
    setMenuOpen(false);
    router.push({ pathname: '/goal-form', params: { id } });
  }

  async function handleDelete(action: string, id: string) {
    if (action === "delete") {
      const res = await deleteGoal(id);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData();
        setConfirmDelete({ show: false, id: "", message: "" });
        router.back();
      }

    }
    setConfirmDelete({ show: false, id: "", message: "" });
  }

  if (loading && !goal) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={sectionColor} />
      </View>
    );
  }

  const current = goal?.montant_actuel || 0;
  const target = goal?.montant_cible || 0;
  const progress = target > 0 ? Math.min(current / target, 1) : 0;

  return (
    <MainHeader
      height={100}
      header={() => <DetailHeader title="Détail de l'objectif" />}
    >
      <DeleteModal onChange={handleDelete} visible={confirmDelete.show} message={confirmDelete.message} id={confirmDelete.id} />

      <RenderImage
        value={goal?.image ? { uri: goal.image } : goalCoverImage(goal?.type || "")}
        onChange={setShowImage}
        visible={showImage}
      />

      <Pressable onPress={() => setShowImage(true)} style={[styles.image, { backgroundColor: cardBg, borderColor: border, height: 200, marginBottom: 10, position: 'relative' }]}>
        <MenuButton position={{ right: 5, top: 5 }}>
          <MenuItem onPress={handleEdit} >
            <Pencil size={18} color={textColor} />
            <Text style={{ color: textColor, fontSize: 15 }}>Modifier</Text>
          </MenuItem>
          <View style={{ height: 1, backgroundColor: border }} />
          <MenuItem onPress={() => setConfirmDelete({ show: true, id: goal?.id || "", message: `Voulez-vous vraiment supprimer l'objectif "${goal?.titre || ""}"?` })}>
            <Trash2 size={18} color={dangerColor} />
            <Text style={{ color: dangerColor, fontSize: 15 }}>Supprimer</Text>
          </MenuItem>
        </MenuButton>
        <Image
          source={goal?.image ? { uri: goal.image } : goalCoverImage(goal?.type || "")}
          style={[styles.previewImage, { marginBottom: 12, minHeight: 200, backgroundColor: cardBg, borderColor: border }]}
          resizeMode='cover'
        />
      </Pressable>
      <View style={[styles.infoGrid, {}]}>
        <View style={[styles.infoGridFull, styles.miniCard, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.name, { color: textColor }]}>{goal?.titre}</Text>
          <Text style={[styles.category, { color: textColor }]}>{getGoalType(goal?.type || "")}</Text>

          <View style={{ marginVertical: 12 }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: border, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  backgroundColor: sectionColor,
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={[styles.date, { color: textColor, marginTop: 4 }]}>
              {Math.round(progress * 100)}% atteint
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={[styles.date, { color: textColor, opacity: 0.6 }]}>Montant actuel</Text>
              <Text style={[styles.price, { color: textColor }]}>{formatMoney(current)}</Text>
            </View>
            <View>
              <Text style={[styles.date, { color: textColor, opacity: 0.6 }]}>Objectif</Text>
              <Text style={[styles.price, { color: sectionColor }]}>{formatMoney(target)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={[styles.date, { color: textColor }]}>
              Créé le {formatDateLong(goal?.created_at || toISODate(new Date()))}
            </Text>
            <Text style={[styles.date, { color: dangerColor }]}>
              Échéance {formatDateLong(goal?.date_limite || toISODate(new Date()))}
            </Text>
          </View>
        </View>
      </View>

      <Pressable onPress={() => setMenuOpen((v) => !v)} style={{ padding: 8, position: 'absolute', top: 15, right: 15, zIndex: 1, backgroundColor, borderRadius: 100 }}>
        <MoreVertical size={22} color={textColor} />
      </Pressable>
    </MainHeader>
  )
}