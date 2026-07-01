import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { CircleDollarSignIcon, Edit, LucideTrash2, Plus, Search } from 'lucide-react-native'
import { styles } from '@/styles/styles'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useAppColors } from '@/hooks/useAppColors'
import { Goal } from '@/types/db'
import { deleteGoal, getGoal } from '@/db/goal'
import EmptyData from '@/components/ui/empty-data'
import { depenseCoverImage, goalCoverImage } from '@/constants/image'
import { useBudgetStore } from '@/store/budgetStore'
import { formatDateLong } from '@/utils/dateFormat'
import { ToastAndroid } from 'react-native'
import { formatCompactNumber, formatMoney } from '@/utils/numberFormat';
import { getGoalType } from '@/constants/type'
import DeleteModal from '@/components/ui/DeleteModal'

export default function budget() {
  const { sectionColor, border, backgroundColor, textColor, labelColor } = useAppColors();
  const { search }: { search: string } = useLocalSearchParams();
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });


  const [budget, setBudget] = useState<Goal[]>([]);
  const [filtered, setFiltered] = useState<Goal[]>([]);

  const { devise } = useBudgetStore();

  const loadData = async (search: string) => {
    const data: Goal[] = await getGoal();
    setBudget(data);
    const dataFiltered = search ? data.filter((d: Goal) => d.titre.toLowerCase().includes(search.toLowerCase())) : data;
    setFiltered(dataFiltered);
  }

  useFocusEffect(
    useCallback(() => {
      loadData(search);
    }, [search])
  )

  const handleDelete = async (action: string, id: string) => {
    if (action === "delete" && id) {
      const res = await deleteGoal(id);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData(search);
        setConfirmDelete({ show: false, id: "", message: "" });
      }
    }

    setConfirmDelete({ show: false, id: "", message: "" });
  };

  return (
    <View style={[styles.container]}>
      <DeleteModal onChange={handleDelete} visible={confirmDelete.show} message={confirmDelete.message} id={confirmDelete.id} />
      <Pressable
        onPress={() => router.push("/goal-form")}
        style={({ pressed }) => [
          styles.fab,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
          { backgroundColor: sectionColor, borderColor: border },
        ]}
      >
        <Plus color={"#fff"} size={24} />
      </Pressable>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1, position: "relative" }}
      >
        {budget.length === 0 &&
          <EmptyData
            message="Aucune donnée disponible."
            icon={<CircleDollarSignIcon color={labelColor} size={100} />}
          />}
        {filtered.length === 0 && budget.length > 0 && search &&
          <EmptyData
            message="Aucune donnée trouvée."
            icon={<Search color={labelColor} size={100} />}
          />}
        <View style={styles.grid}>
          {filtered.map((goal: Goal) => (
            <View key={goal.id} style={[styles.card, { backgroundColor, borderColor: border, position: "relative" }]}>
              <Pressable
                onPress={() => router.push({ pathname: `/detail-budget`, params: { id: goal.id } })}
                key={goal.id}
                style={({ pressed }) => [
                  pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                ]}
              >
                <Image
                  source={goal.image ? { uri: goal.image } : goalCoverImage(goal.type)}
                  style={[
                    styles.image,
                    { borderColor: border },
                  ]}
                />
                <View style={styles.cardContent}>
                  <Text style={[styles.name, { color: textColor }]}>{goal.titre}</Text>
                  <Text style={[styles.text, { color: textColor }]}>{getGoalType(goal.type)}</Text>
                  <Text style={styles.price}>{formatCompactNumber(goal.montant_cible, devise)} { }</Text>
                  <Text style={[styles.date, { color: textColor }]}>{formatDateLong(goal.date_limite)} </Text>
                </View>
              </Pressable>
              <View style={[styles.actions]}>
                <Pressable
                  onPress={() => router.push({ pathname: "/goal-form", params: { id: goal.id } })}
                >
                  <Edit color={sectionColor} size={20} />
                </Pressable>
                <Pressable
                  onPress={() =>
                    setConfirmDelete({
                      show: true,
                      id: goal.id,
                      message: `Voulez-vous vraiment supprimer l'objectif "${goal.titre}"?`
                    })}>
                  <LucideTrash2 color={"red"} size={22} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
