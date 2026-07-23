import { View, Text, ScrollView, Image, Pressable, ToastAndroid } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { styles } from '@/styles/styles';
import { useAppColors } from '@/hooks/useAppColors';
import { addRecentSearch, clearRecentSearchId, getDetailRoute, getGlobalSearch, getRecentSearchWithData } from '@/controller/search.controller';
import { Depense, DepenseItem, Goal, Provision } from '@/types/db';
import { formatDateLong, formatDateRelative } from '@/utils/date.util';
import { Apple, CameraOff, CircleDollarSignIcon, Search, ShoppingBasket, X } from "lucide-react-native";
import { formatMoney } from '@/utils/number.util';
import EmptyData from '@/components/ui/empty-data';
import { MainHeader } from '@/components/header/header-main';
import { HeaderWithSearch } from './_layout';
import { depenseCoverImage } from '@/constants/image';

export default function GlobalSearch() {
  const { search } = useLocalSearchParams();
  const { inputBg, textColor, labelColor, border, sectionColor, cardBg, dangerColor } = useAppColors();

  const [loading, setLoading] = useState(false);
  const [depense, setDepense] = useState<Depense[]>([]);
  const [provision, setProvision] = useState<Provision[]>([]);
  const [goal, setGoal] = useState<Goal[]>([]);
  const [items, setItems] = useState<DepenseItem[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!search) {
        getRecentSearchWithData().then(setRecent);
      }
      handleSearch();
    }, [search])
  );

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

  async function handleClearById(id: string) {
    const res = await clearRecentSearchId(id);
    const data = JSON.parse(res as string);
    if (data.success) {
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
      getRecentSearchWithData().then(setRecent);
    }
  }

  return (
    <MainHeader
      height={110}
      header={() => <HeaderWithSearch searchable={true} title="" />}
    >
      {search && !hasNoResults &&
        <Text style={[styles.text, { color: labelColor, fontSize: 16, marginBottom: 12 }]}>
          Résultat du "
          <Text style={{ color: sectionColor, fontWeight: 'bold' }}>{search}</Text> "
        </Text>}

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

      {!loading && !search && recent.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.label, { color: sectionColor, marginBottom: 12 }]}>
            Dernières recherches
          </Text>
          {recent.map((r) => {
            if (!r.data) return null

            const text = r.data.name || r.data.nom || r.data.titre || r.data.label || r.data.type || r.data.libelle || r.data.title || r.data.categorie;

            const type = r.type === "depense" ? "Dépense" : r.type === "provision" ? "Provision" : r.type === "budget" ? "Budget" : r.type === "item" ? "Article" : "";

            return (
              <View key={`${r.type}-${r.id}`} style={[styles.card, styles.infoGridFull, styles.rowSpacing, { backgroundColor: cardBg, borderColor: border }]}>
                <Pressable
                  style={{ gap: 5 }}
                  onPress={() => router.push({ pathname: getDetailRoute(r.type), params: { id: r.id } })}
                >
                  <Text style={[styles.name, { color: textColor }]}>
                    {`${text} ( ${type} )`}
                  </Text>
                  <Text style={[styles.date, { color: textColor }]}>
                    {formatDateRelative(r.clickedAt)}
                  </Text>
                </Pressable>
                <Pressable>
                  <X color={dangerColor} size={20} onPress={() => handleClearById(r.id)} />
                </Pressable>
              </View>
            )
          })}
        </View>
      )}

      {!loading && !search && recent.length === 0 && (
        <EmptyData message="Tapez un mot pour initialiser la recherche ..." icon={<Search color={labelColor} size={50} />} />
      )}

      {!loading && depense.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.category, { color: sectionColor, marginBottom: 12, letterSpacing: 2, fontSize: 18 }]}>
            <ShoppingBasket color={sectionColor} size={16} /> Dépenses
          </Text>
          {depense.slice(0, 5).map((d) => (
            <Pressable
              key={d.id}
              onPress={() => {
                addRecentSearch("depense", d.id);
                router.push({ pathname: '/detail-shopping', params: { id: d.id } });
              }}
              style={[styles.card, styles.infoGridFull, { gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 5, borderColor: border, backgroundColor: cardBg }]}
            >
              <Image
                source={d.items?.[0]?.image ? { uri: d.items[0].image } : depenseCoverImage(d.categorie as string)}
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
          {items.slice(0, 5).map((d, i) => (
            <Pressable
              key={i}
              onPress={() => {
                addRecentSearch("item", d.id);
                router.push({ pathname: '/detail-item', params: { id: d.id } });
              }}
              style={[styles.card, styles.infoGridFull, { gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 5, borderColor: border, backgroundColor: cardBg }]}
            >
              {d?.image ?
                <Image
                  source={{ uri: d.image }}
                  style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]}
                /> : <View style={[styles.logo, styles.centered, { width: 50, height: 50, backgroundColor: inputBg }]}>
                  <CameraOff color={labelColor} size={18} /></View>}
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
          {provision.slice(0, 5).map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => {
                addRecentSearch("provision", p.id);
                router.push({ pathname: '/detail-provision', params: { id: p.id } });
              }}
              style={[styles.card, styles.infoGridFull, { gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 5, borderColor: border, backgroundColor: cardBg }]}
            >{p.image ?
              <Image
                source={{ uri: p.image }}
                style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]}
              /> : <View style={[styles.logo, styles.centered, { width: 50, height: 50, backgroundColor: inputBg }]}>
                <CameraOff color={labelColor} size={18} /></View>}
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
              onPress={() => {
                addRecentSearch("budget", g.id);
                router.push({ pathname: '/detail-budget', params: { id: g.id } });
              }}
              style={[styles.card, styles.infoGridFull, { gap: 10, flexDirection: "row", alignItems: 'center', marginBottom: 5, borderColor: border, backgroundColor: cardBg }]}
            >{g.image ?
              <Image
                source={{ uri: g.image }}
                style={[styles.logo, { width: 50, height: 50, backgroundColor: inputBg }]}
              /> : <View style={[styles.logo, styles.centered, { width: 50, height: 50, backgroundColor: inputBg }]}>
                <CameraOff color={labelColor} size={18} /></View>}
              <View style={[{ width: "80%", gap: 5 }]}>
                <Text style={[styles.name, { color: textColor }]}>{g.titre}</Text>
                <Text style={[styles.category, { color: textColor }]}>{formatMoney(g?.montant_cible || 0)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </MainHeader>
  );
}