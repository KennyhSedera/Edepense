import { Pressable, Text, View, FlatList, ActivityIndicator, ToastAndroid } from 'react-native'
import React, { useCallback, useState } from 'react'
import { HeaderWithSearch } from './_layout'
import { useAppColors } from '@/hooks/useAppColors';
import { MainHeader } from '@/components/header/header-main'
import { router, useFocusEffect } from 'expo-router';
import { styles } from '@/styles/styles';
import { Plus, ShoppingCart, Calendar, Pencil, Trash2, MoreVertical, Check } from 'lucide-react-native';
import { getListesCourse, deleteListeCourse } from '@/controller/liste-course.controller';
import { ListeCourse } from '@/types/db';
import { formatDateStringForDisplay, toISODate } from '@/utils/date.util';
import EmptyData from '@/components/ui/empty-data';
import MenuButton, { MenuItem } from '@/components/input/MenuButton';
import DeleteModal from '@/components/modal/DeleteModal';

const MAX_ITEMS_PREVIEW = 3;

export default function CourseScreen() {
  const { sectionColor, border, cardBg, textColor, dangerColor, labelColor } = useAppColors();
  const [listes, setListes] = useState<ListeCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: "", message: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getListesCourse();
      setListes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleEdit(id: string) {
    router.push({ pathname: '/course-form', params: { id } });
  }

  async function handleDelete(action?: string, id?: string) {
    if (action === "delete" && id) {
      const res = await deleteListeCourse(id);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData();
      }
    }
    setConfirmDelete({ show: false, id: "", message: "" });
  }

  function getDateInfo(dateAchat?: string) {
    if (!dateAchat) return null;

    const aujourdhui = toISODate(new Date());
    const demain = toISODate((() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    })());

    if (dateAchat < aujourdhui) {
      return { label: `En retard · ${formatDateStringForDisplay(dateAchat)}`, color: dangerColor };
    }
    if (dateAchat === aujourdhui) {
      return { label: "Aujourd'hui", color: sectionColor };
    }
    if (dateAchat === demain) {
      return { label: "Demain", color: sectionColor };
    }
    return { label: formatDateStringForDisplay(dateAchat), color: labelColor };
  }

  function renderItem({ item }: { item: ListeCourse }) {
    const total = item.items.length;
    const achetes = item.items.filter((i) => i.achete).length;
    const progress = total > 0 ? achetes / total : 0;
    const restants = total - achetes;
    const dateInfo = getDateInfo(item.date_achat);
    const apercuItems = item.items.slice(0, MAX_ITEMS_PREVIEW);
    const surplus = total - apercuItems.length;

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/course-detail', params: { id: item.id } })}
        style={[
          styles.miniCard,
          { backgroundColor: cardBg, borderColor: border, marginBottom: 12, padding: 14, position: 'relative' },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: `${sectionColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingCart size={20} color={sectionColor} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: textColor }]}>{item.titre}</Text>
            <Text style={[styles.date, { color: textColor, opacity: 0.6 }]}>
              {total === 0 ? "Aucun article" : `${restants} article(s) restant(s)`}
            </Text>
          </View>

          {dateInfo && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: `${dateInfo.color}20`,
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Calendar size={12} color={dateInfo.color} />
              <Text style={{ color: dateInfo.color, fontSize: 11, fontWeight: '600' }}>
                {dateInfo.label}
              </Text>
            </View>
          )}
        </View>

        <MenuButton position={{ right: 0, bottom: 0 }} iconSize={14}>
          <MenuItem onPress={() => handleEdit(item.id)}>
            <Pencil size={18} color={textColor} />
            <Text style={{ color: textColor, fontSize: 15 }}>Modifier</Text>
          </MenuItem>
          <View style={{ height: 1, backgroundColor: border }} />
          <MenuItem
            onPress={() => {
              setConfirmDelete({
                show: true,
                id: item.id,
                message: `Voulez-vous vraiment supprimer la liste "${item.titre}" ?`,
              });
            }}
          >
            <Trash2 size={18} color={dangerColor} />
            <Text style={{ color: dangerColor, fontSize: 15 }}>Supprimer</Text>
          </MenuItem>
        </MenuButton>

        {/* Aperçu des articles (3 max) */}
        {apercuItems.length > 0 && (
          <View style={{ marginBottom: 10, gap: 4 }}>
            {apercuItems.map((article) => {
              const quantitePart =
                article.quantite && article.unite
                  ? ` (${article.quantite} ${article.unite})`
                  : article.quantite
                    ? ` (x${article.quantite})`
                    : "";

              return (
                <View key={article.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      borderWidth: 1.5,
                      borderColor: article.achete ? sectionColor : border,
                      backgroundColor: article.achete ? sectionColor : "transparent",
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {article.achete ? <Check size={9} color="#fff" /> : null}
                  </View>
                  <Text
                    style={{
                      color: textColor,
                      opacity: article.achete ? 0.5 : 0.8,
                      fontSize: 13,
                      textDecorationLine: article.achete ? 'line-through' : 'none',
                    }}
                  >
                    {article.nom}
                    <Text style={{ opacity: 0.6 }}>{quantitePart}</Text>
                  </Text>
                </View>
              );
            })}
            {surplus > 0 && (
              <Text style={{ color: labelColor, fontSize: 12, marginLeft: 20 }}>
                + {surplus} autre(s) article(s)
              </Text>
            )}
          </View>
        )}

        {total > 0 && (
          <View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: border, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  backgroundColor: sectionColor,
                  borderRadius: 3,
                }}
              />
            </View>
            <Text style={[styles.date, { color: textColor, opacity: 0.5, marginTop: 4, fontSize: 12 }]}>
              {achetes}/{total} articles achetés
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Mes courses" />}
      fab={
        <Pressable
          onPress={() => router.push("/course-form")}
          style={({ pressed }) => [
            styles.fab,
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            { backgroundColor: sectionColor, borderColor: border },
          ]}
        >
          <Plus color={"#fff"} size={24} />
        </Pressable>
      }
    >
      <DeleteModal
        onChange={handleDelete}
        visible={confirmDelete.show}
        message={confirmDelete.message}
        id={confirmDelete.id}
      />

      {loading && listes.length === 0 ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={sectionColor} />
        </View>
      ) : listes.length === 0 ? (
        <EmptyData
          icon={<ShoppingCart size={40} color={labelColor} />}
          message="Aucune liste de courses pour le moment."
        />
      ) : (
        <FlatList data={listes} keyExtractor={(item) => item.id} renderItem={renderItem} scrollEnabled={false} />
      )}
    </MainHeader>
  );
}