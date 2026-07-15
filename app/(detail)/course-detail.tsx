import { View, Text, Pressable, FlatList, ActivityIndicator, TextInput, ToastAndroid, ScrollView, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import {
  getListeCourseById,
  addItemToListe,
  toggleItemAchete,
  removeItemFromListe,
  convertirListeEnDepense,
} from '@/controller/liste-course.controller';
import { ListeCourse, CourseItem } from '@/types/db';
import { useAppColors } from '@/hooks/useAppColors';
import { styles } from '@/styles/styles';
import { Check, Plus, Trash2, X } from 'lucide-react-native';
import { MainHeader } from '@/components/header/header-main';
import { DetailHeader } from './_layout';
import { matchProduit } from '@/utils/produit-matcher';
import Field from "@/components/input/InputText";
import SelectChipsMenu from "@/components/input/select-chips-menu";
import { UNITE, DIMENSION } from "@/constants/type";
import MenuModal from "@/components/modal/menu-modal";

export default function CourseDetail() {
  const { id }: { id: string } = useLocalSearchParams();
  const [liste, setListe] = useState<ListeCourse>();
  const [loading, setLoading] = useState(true);

  const [nomItem, setNomItem] = useState("");
  const [quantiteItem, setQuantiteItem] = useState("1");
  const [uniteItem, setUniteItem] = useState("piece");
  const [itemError, setItemError] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [prix, setPrix] = useState<Record<string, string>>({});
  const [converting, setConverting] = useState(false);

  const { textColor, cardBg, border, sectionColor, dangerColor, inputBg, labelColor } = useAppColors();

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getListeCourseById(id);
      setListe(data ?? undefined);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function validateItem(): Record<string, string> | null {
    const errors: Record<string, string> = {};

    if (!nomItem.trim()) {
      errors.nom = "Le nom de l'article est requis.";
    }

    const parsedQuantity = parseFloat(quantiteItem);
    if (quantiteItem.trim() && (isNaN(parsedQuantity) || parsedQuantity <= 0)) {
      errors.quantite = "Quantité doit être un nombre supérieur à zéro.";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  async function handleAddItem() {
    const errors = validateItem();
    if (errors) {
      setItemError(errors);
      return;
    }

    if (!liste) return;

    const produit = matchProduit?.(nomItem.trim());

    const item: CourseItem = {
      id: Date.now().toString(),
      nom: produit?.name ?? nomItem.trim(),
      quantite: quantiteItem.trim() ? Number(quantiteItem) : undefined,
      unite: uniteItem || undefined,
      achete: false,
      produit_id: produit?.id,
    };

    await addItemToListe(liste.id, item);
    setShowForm(false);
    setNomItem("");
    setQuantiteItem("1");
    setUniteItem("piece");
    setItemError({});
    loadData();
  }

  async function handleToggle(itemId: string) {
    if (!liste) return;
    await toggleItemAchete(liste.id, itemId);
    loadData();
  }

  async function handleRemove(itemId: string) {
    if (!liste) return;
    await removeItemFromListe(liste.id, itemId);
    loadData();
  }

  function openConvertModal() {
    const itemsAchetes = liste?.items.filter((i) => i.achete) ?? [];
    const initialPrix: Record<string, string> = {};
    for (const item of itemsAchetes) {
      initialPrix[item.id] = prix[item.id] ?? "";
    }
    setPrix(initialPrix);
    setShowConvertModal(true);
  }

  async function handleConvertir() {
    if (!liste) return;

    const itemsAchetes = liste.items.filter((i) => i.achete);

    const manquants = itemsAchetes.filter((item) => !prix[item.id] || isNaN(Number(prix[item.id])));
    if (manquants.length > 0) {
      ToastAndroid.show("Renseigne un prix pour chaque article.", ToastAndroid.SHORT);
      return;
    }

    setConverting(true);
    try {
      const prixParItem: Record<string, number> = {};
      for (const item of itemsAchetes) {
        const prixUnitaire = Number(prix[item.id]);
        const quantite = item.quantite ?? 1;
        prixParItem[item.id] = prixUnitaire * quantite;
      }

      const res = await convertirListeEnDepense(liste.id, prixParItem);
      const data = JSON.parse(res);

      if (data.success) {
        ToastAndroid.show("Dépense créée avec succès.", ToastAndroid.SHORT);
        setShowConvertModal(false);
        router.push("/shopping");
      } else {
        ToastAndroid.show(data.message ?? "Erreur lors de la conversion.", ToastAndroid.SHORT);
      }
    } finally {
      setConverting(false);
    }
  }

  if (loading && !liste) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={sectionColor} />
      </View>
    );
  }

  const itemsAchetes = liste?.items.filter((i) => i.achete) ?? [];

  function renderItem({ item }: { item: CourseItem }) {
    const quantitePart =
      item.quantite && item.unite
        ? ` (${item.quantite} ${item.unite})`
        : item.quantite
          ? ` (x${item.quantite})`
          : "";

    return (
      <View
        style={[
          styles.miniCard,
          { backgroundColor: cardBg, borderColor: border, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
        ]}
      >
        <Pressable
          onPress={() => handleToggle(item.id)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: item.achete ? sectionColor : border,
            backgroundColor: item.achete ? sectionColor : "transparent",
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.achete ? <Check size={14} color="#fff" /> : null}
        </Pressable>

        <Text
          style={{
            flex: 1,
            color: textColor,
            textDecorationLine: item.achete ? 'line-through' : 'none',
            opacity: item.achete ? 0.5 : 1,
          }}
        >
          {item.nom}
          <Text style={{ opacity: 0.6 }}>{quantitePart}</Text>
        </Text>

        <Pressable onPress={() => handleRemove(item.id)}>
          <Trash2 size={16} color={dangerColor} />
        </Pressable>
      </View>
    );
  }

  return (
    <MainHeader height={100} header={() => <DetailHeader title={liste?.titre || "Liste de courses"} />}>
      {showForm ?
        <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, padding: 12, marginBottom: 16 }]}>
          <View style={styles.itemsHeader}>
            <Text style={[styles.section, { color: sectionColor }]}>Ajouter un article</Text>
            <Pressable onPress={() => setShowForm(false)}>
              <X size={20} color={dangerColor} />
            </Pressable>
          </View>

          <View style={[styles.itemCard, { borderColor: border, backgroundColor: inputBg }]}>
            <Field
              label="Nom de l'article *"
              value={nomItem}
              onChangeText={(v) => {
                setNomItem(v);
                if (itemError.nom) setItemError({ ...itemError, nom: "" });
              }}
              placeholder="Ex : Tomates"
              compact
              error={itemError.nom}
              onFocus={() => setItemError({ ...itemError, nom: "" })}
            />

            <View style={styles.itemNumbersRow}>
              <Field
                label="Quantité"
                value={quantiteItem}
                onChangeText={(v) => {
                  setQuantiteItem(v);
                  if (itemError.quantite) setItemError({ ...itemError, quantite: "" });
                }}
                placeholder="1"
                keyboardType="numeric"
                style={{ flex: 1, marginRight: 8 }}
                compact
                error={itemError.quantite}
                onFocus={() => setItemError({ ...itemError, quantite: "" })}
              />

              <SelectChipsMenu
                data={UNITE}
                value={uniteItem}
                setValue={setUniteItem}
                position={{ top: 60, right: 0, width: DIMENSION.width - 70 }}
                style={{ width: "35%" }}
              />
            </View>

            <TouchableOpacity
              style={[styles.addItemButton, { borderColor: sectionColor }]}
              onPress={handleAddItem}
            >
              <Plus color={sectionColor} size={16} style={{ marginRight: 6 }} />
              <Text style={[styles.buttonText, { color: sectionColor }]}>
                Ajouter à la liste
              </Text>
            </TouchableOpacity>
          </View>
        </View> :
        <TouchableOpacity
          style={[styles.addItemButton, { borderColor: sectionColor, marginBottom: 16 }]}
          onPress={() => setShowForm(true)}
        >
          <Plus color={sectionColor} size={16} style={{ marginRight: 6 }} />
          <Text style={[styles.buttonText, { color: sectionColor }]}>
            Ajouter un nouvel article
          </Text>
        </TouchableOpacity>
      }

      {/* --- Liste des articles --- */}
      {liste?.items.length ? (
        <FlatList data={liste.items} keyExtractor={(item) => item.id} renderItem={renderItem} scrollEnabled={false} />
      ) : (
        <Text style={{ color: textColor, opacity: 0.6, textAlign: 'center', marginTop: 20 }}>
          Aucun article pour le moment.
        </Text>
      )}

      {/* --- Bouton de conversion en dépense --- */}
      {itemsAchetes.length > 0 && (
        <Pressable
          onPress={openConvertModal}
          style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 16, marginBottom: 40 }]}
        >
          <Text style={styles.buttonText}>
            Convertir {itemsAchetes.length} article(s) en dépense
          </Text>
        </Pressable>
      )}

      {/* --- Modal de saisie des prix avant conversion, via MenuModal --- */}
      <MenuModal visible={showConvertModal} onChange={() => setShowConvertModal(false)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, }}>
          <Text style={{ color: textColor, fontSize: 18, fontWeight: '600' }}>Prix des articles</Text>
          <Pressable onPress={() => setShowConvertModal(false)}>
            <X size={22} color={textColor} />
          </Pressable>
        </View>

        <ScrollView style={{ maxHeight: 400 }}>
          {itemsAchetes.map((item) => {
            const quantitePart =
              item.quantite && item.unite
                ? `${item.quantite} ${item.unite}`
                : item.quantite
                  ? `x${item.quantite}`
                  : null;

            return (
              <View
                key={item.id}
                style={[styles.miniCard, { backgroundColor: cardBg, borderColor: border, marginBottom: 10 }]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: textColor, fontWeight: '500' }}>
                    {item.nom} {quantitePart ? <Text style={{ opacity: 0.6 }}>({quantitePart})</Text> : null}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TextInput
                    value={prix[item.id] ?? ""}
                    onChangeText={(text) => setPrix({ ...prix, [item.id]: text })}
                    placeholder={item.quantite ? "Prix unitaire" : "Prix"}
                    placeholderTextColor={labelColor}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      backgroundColor: inputBg,
                      borderColor: border,
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      color: textColor,
                    }}
                  />
                  {item.quantite && item.quantite > 1 && prix[item.id] ? (
                    <Text style={{ color: textColor, opacity: 0.6, fontSize: 12 }}>
                      Total : {(Number(prix[item.id]) * item.quantite).toLocaleString("fr-FR")} Ar
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={handleConvertir}
          disabled={converting}
          style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 8, opacity: converting ? 0.6 : 1 }]}
        >
          <Text style={styles.buttonText}>
            {converting ? "Conversion..." : "Créer la dépense"}
          </Text>
        </Pressable>
      </MenuModal>
    </MainHeader>
  );
}