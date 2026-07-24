import { Pressable, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useCallback, useState } from 'react'
import { HeaderWithSearch } from './_layout'
import { useAppColors } from '@/hooks/useAppColors';
import { MainHeader } from '@/components/header/header-main'
import { router, useFocusEffect } from 'expo-router';
import { styles } from '@/styles/styles';
import { CircleDollarSign, Plus } from 'lucide-react-native';
import { getBudget, reinitBudget } from '@/controller/budget.controller';
import { Budget } from '@/types/db';
import { formatMoney } from '@/utils/number.util';
import { Image } from 'react-native';
import EmptyData from '@/components/ui/empty-data';

export default function BudgetScreen() {
  const { sectionColor, border, cardBg, textColor, labelColor } = useAppColors();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await reinitBudget();
      const data = await getBudget();
      setBudgets(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function renderItem({ item }: { item: Budget }) {
    const progress =
      item.budgetTotal > 0
        ? Math.min(Math.max(1 - item.budgetRestant / item.budgetTotal, 0), 1)
        : 0;

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/detail-budget', params: { id: item.id } })}
        style={[styles.miniCard, { backgroundColor: cardBg, borderColor: border, marginBottom: 12 }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image
            source={item.budgetImage ? { uri: item.budgetImage } : require("@/assets/images/depense/log.jpg")}
            style={{ width: 44, height: 44, borderRadius: 10 }}
            resizeMode="cover"
          />

          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: textColor }]}>{item.budgetName}</Text>

            <View style={{ height: 8, borderRadius: 4, backgroundColor: border, overflow: 'hidden', marginTop: 6 }}>
              <View
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  backgroundColor: sectionColor,
                  borderRadius: 4,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={[styles.date, { color: textColor, opacity: 0.6 }]}>
                Restant : {formatMoney(item.budgetRestant)}
              </Text>
              <Text style={[styles.date, { color: textColor, opacity: 0.6 }]}>
                Total : {formatMoney(item.budgetTotal)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Mes budgets" />}
      fab={
        <Pressable
          onPress={() => router.push("/budget-form")}
          style={({ pressed }) => [
            styles.fab,
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            { backgroundColor: sectionColor, borderColor: border, bottom: 50, right: 20 },
          ]}
        >
          <Plus color={"#fff"} size={24} />
        </Pressable>
      }
    >
      {loading && budgets.length === 0 ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={sectionColor} />
        </View>
      ) : budgets.length === 0 ? (
        <EmptyData message="Aucun budget enregistré" icon={<CircleDollarSign color={labelColor} size={48} />} />
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      )}
    </MainHeader>
  );
}