import { View, Text, ScrollView, Image, Pressable } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { styles } from '@/styles/styles';
import { useAppColors } from '@/hooks/useAppColors';
import { getGlobalSearch } from '@/controller/search';
import { Depense, DepenseItem, Goal, Provision } from '@/types/db';
import { formatDateLong } from '@/utils/dateFormat';
import { Apple, CircleDollarSignIcon, Search, ShoppingBasket } from "lucide-react-native";
import { formatMoney } from '@/utils/numberFormat';
import EmptyData from '@/components/ui/empty-data';

export default function GlobalSearch() {
  const { search } = useLocalSearchParams();
  const { inputBg, textColor, labelColor, border, sectionColor, cardBg } = useAppColors();

  const [loading, setLoading] = useState(false);
  const [depense, setDepense] = useState<Depense[]>([]);
  const [provision, setProvision] = useState<Provision[]>([]);
  const [goal, setGoal] = useState<Goal[]>([]);
  const [items, setItems] = useState<DepenseItem[]>([]);

  const hasNoResults =
    depense.length <= 0 &&
    provision.length <= 0 &&
    goal.length <= 0 &&
    items.length <= 0;

  async function handleSearch() {
    if (!search) {
      setDepense([]);
      setProvision([]);
      setGoal([]);
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getGlobalSearch(search as string);
      setDepense(data?.depense ?? []);
      setProvision(data?.provision ?? []);
      setGoal(data?.goal ?? []);
      setItems(data?.items ?? []);
    } catch (error) {
      console.log(error);
      setDepense([]);
      setProvision([]);
      setGoal([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      handleSearch();

    }, [search])
  );

  return (
    <ScrollView style={[styles.container]} contentContainerStyle={styles.scrollContent}>
      {search && !hasNoResults && <Text style={[styles.text, { color: labelColor, fontSize: 16, marginBottom: 12 }]}>Résultat du " <Text style={{ color: sectionColor, fontWeight: 'bold' }}>{search}</Text> "</Text>}

      {loading && [1, 2, 3].slice(0, 5).map(i => (
        <View key={i} style={[{ gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 12 }]}>
          <View style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]} />
          <View style={[{ width: "80%", gap: 8 }]}>
            <View style={[styles.cardTextMode, { width: "40%", height: 15, backgroundColor: inputBg }]} />
            <View style={[styles.cardTextMode, { width: "100%", height: 15, backgroundColor: inputBg }]} />
          </View>
        </View>
      ))}

      {!loading && search && hasNoResults && (
        <EmptyData
          message={`Aucun résultat pour "${search}"`}
          icon={<Search color={labelColor} size={50} />}

        />
      )}

      {!loading && !search && (
        <EmptyData
          message={`Tapez un mot pour initialiser la recherche ...`}
          icon={<Search color={labelColor} size={50} />}

        />
      )}

      {!loading && depense.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.category, { color: sectionColor, marginBottom: 12, letterSpacing: 2, fontSize: 18 }]}>
            <ShoppingBasket color={sectionColor} size={16} /> Dépenses
          </Text>
          {depense.slice(0, 5).map((d) => (
            <Pressable
              key={d.id}
              onPress={() => router.push({ pathname: '/detail-shopping', params: { id: d.id } })}
              style={[styles.card, styles.infoGridFull, { gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 5, borderColor: border, backgroundColor: cardBg }]}
            >
              <Image
                source={d.items?.[0]?.image ? { uri: d.items[0].image } : undefined}
                style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]}
              />
              <View style={[{ width: "80%", gap: 5 }]}>
                <Text style={[styles.name, { color: textColor }]}>{d.categorie}</Text>
                <Text style={[styles.category, { color: textColor }]}>
                  {d?.description || `Dépense le ${formatDateLong(d.date)}`}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {!loading && items.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.category, { color: sectionColor, marginBottom: 12, letterSpacing: 2, fontSize: 18 }]}>
            <ShoppingBasket color={sectionColor} size={16} /> Articles
          </Text>
          {items.slice(0, 5).map((d) => (
            <Pressable
              key={d.id}
              onPress={() => router.push({ pathname: '/detail-item', params: { id: d.id } })}
              style={[styles.card, styles.infoGridFull, { gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 5, borderColor: border, backgroundColor: cardBg }]}
            >
              {d.image ?
                <Image
                  source={d?.image ? { uri: d.image } : undefined}
                  style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]}
                /> : <View style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]} />}
              <View style={[{ width: "80%", gap: 5 }]}>
                <Text style={[styles.name, { color: textColor }]}>{d.name}</Text>
                <Text style={[styles.category, { color: textColor }]}>{`${d?.quantity} ${d.unit}`}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {!loading && provision.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.category, { color: sectionColor, marginBottom: 12, letterSpacing: 2, fontSize: 18 }]}>
            <Apple color={sectionColor} size={16} /> Provisions
          </Text>
          {provision.slice(0, 5).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => router.push({ pathname: "/detail-provision", params: { id: p.id } })}
              style={[styles.card, styles.infoGridFull, { gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 5, borderColor: border, backgroundColor: cardBg }]}
            >{p.image ?
              <Image
                source={p?.image ? { uri: p.image } : undefined}
                style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]}
              /> : <View style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]} />}
              <View style={[{ width: "80%", gap: 5 }]}>
                <Text style={[styles.name, { color: textColor }]}>{p.nom}</Text>
                <Text style={[styles.category, { color: textColor }]}>{`Quantité restants ${p.quantite_restante} ${p.unite}`}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {!loading && goal.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.category, { color: sectionColor, marginBottom: 12, letterSpacing: 2, fontSize: 18 }]}>
            <CircleDollarSignIcon color={sectionColor} size={16} /> Objectifs
          </Text>
          {goal.slice(0, 5).map((g) => (
            <Pressable
              key={g.id}
              onPress={() => router.push({ pathname: '/detail-budget', params: { id: g.id } })}
              style={[styles.card, styles.infoGridFull, { gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 5, borderColor: border, backgroundColor: cardBg }]}
            >{g.image ?
              <Image
                source={g?.image ? { uri: g.image } : undefined}
                style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]}
              /> : <View style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]} />}
              <View style={[{ width: "80%", gap: 5 }]}>
                <Text style={[styles.name, { color: textColor }]}>{g.titre}</Text>
                <Text style={[styles.category, { color: textColor }]}>{formatMoney(g.montant_cible)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}