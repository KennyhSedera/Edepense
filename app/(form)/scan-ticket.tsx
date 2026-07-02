import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  ToastAndroid,
} from 'react-native';
import { scanReceipt, scanReceiptWithAI, ReceiptItem } from '@/utils/image.util';
import { styles } from '@/styles/styles';
import { useAppColors } from '@/hooks/useAppColors';
import Field from '@/components/ui/InputText';
import { Depense, DepenseItem } from '@/types/db';
import InputDate from '@/components/ui/input-date';
import { setDepense } from '@/controller/depense';
import { router, useFocusEffect } from 'expo-router';
import CategoriSelector from '@/components/ui/categori-selector';
import InputImage from '@/components/ui/input-image';
import { toISODate } from '@/utils/dateFormat';
import NetInfo from '@react-native-community/netinfo';
import EmptyData from '@/components/ui/empty-data';
import { Plus, Trash2, WifiOff } from 'lucide-react-native';
import SelectChipsMenu from '@/components/ui/select-chips-menu';
import { DIMENSION, UNITE } from '@/constants/type';
import { formatCompactNumber } from '@/utils/numberFormat';
import { sendNotification } from '@/services/notificationService';

export default function ScanTicket() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [montant, setMontant] = useState('');
  const [devise, setDevise] = useState('');
  const [date, setDate] = useState('');
  const [categorie, setCategorie] = useState('Alimentation');
  const [merchant, setMerchant] = useState('');
  const { labelColor, inputBg, cardBg, border, sectionColor, dangerColor } = useAppColors();
  const [items, setItems] = useState<DepenseItem[]>([]);
  const [observation, setObservation] = useState('');
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [isOnline, setIsOnline] = useState(true);

  const itemsTotal = items.reduce((total, item) => total + (parseFloat(item.unit_price?.toString()) * parseFloat(item.quantity?.toString()) || 0), 0);

  useEffect(() => {
    setMontant(itemsTotal.toString());
  }, [itemsTotal]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return () => unsubscribe();
  }, []);

  const handleScan = async (uri: string) => {
    if (uri) {
      setImage(uri);
      setLoading(true);
      try {
        const result = isOnline
          ? await scanReceiptWithAI(uri)
          : await scanReceipt(uri);

        setMontant(result.total ?? '');
        setDevise(result.currency ?? '');
        setDate(result.date ?? toISODate(new Date()));
        setMerchant(result.merchant ?? '');

        const depenseItems = result.items.length > 0
          ? result.items.map((item, index) => ({
            id: `${Date.now()}-${index}`,
            name: item.description,
            quantity: 1,
            unit: item.unit || 'piece',
            unit_price: Number(item.amount) || 0,
            total_price: Number(item.amount) * Number(item.quantity) || 0,
            image: image as string,
          }))
          : [
            {
              id: Date.now().toString(),
              name: result.observation ?? '',
              quantity: 1,
              unit: 'piece',
              total_price: Number(result.total) || 0,
              unit_price: Number(result.total) || 0,
              image: image as string,
            }
          ];

        setItems(depenseItems);
        setObservation(result.observation ?? '');
        setCategorie(result.categorie ?? 'Autre');

      } catch (error) {
        console.error('Scan error:', error);
        Alert.alert('Erreur', "Impossible de lire le ticket. Réessayez avec une photo plus nette.");
      } finally {
        setLoading(false);
      }
    } else {
      setImage("");
    }
  };

  const handleConfirm = async () => {
    if (!montant) {
      Alert.alert('Montant requis', 'Veuillez indiquer un montant avant de valider.');
      return;
    }

    const depense: Depense = {
      id: Date.now().toString(),
      montant: Number(montant),
      categorie: categorie,
      description: observation,
      date: new Date(date).toISOString().split("T")[0],
      items,
    };

    try {
      const res = await setDepense(depense);
      const json = JSON.parse(res);

      if (json.success) {
        await sendNotification({
          title: '💰 Nouvelle dépense ajoutée',
          body: "Une nouvelle depense vient d'être ajoutée avec un ticket scanné!",
          route: "/detail-shopping",
          params: { id: depense.id },
        });

        ToastAndroid.show(json.message, ToastAndroid.SHORT);
        router.push({ pathname: "/(tabs)" });
      }
    } catch (error) {
      console.log(error);
    }
  };


  function updateItem(index: number, patch: Partial<DepenseItem>) {

    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }


  function addItem() {
    setError({ ...error, produits: "" })
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", quantity: 1, unit_price: 0, image: undefined, total_price: 0, unit: "piece" },
    ]);
  }
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, padding: 10 }}>

      {!loading && (
        <InputImage
          value={image}
          setValue={handleScan}
          label='Tickes photo'
        />
      )}

      {loading && (
        <EmptyData
          icon={<ActivityIndicator size="large" />}
          message="Lecture du ticket en cours..."
        />
      )}

      {!isOnline && !loading && (
        <EmptyData
          icon={<WifiOff size={50} color={labelColor} />}
          message="Veuillez activer votre connexion internet pour avoir des resultats plus precis et détaillées."
        />
      )}

      {!loading && image && (
        <>
          <View style={[styles.form, { backgroundColor: cardBg, borderColor: border }]}>
            <Field
              label="Merchant"
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Ex: McDonalds"
            />

            <CategoriSelector
              categorie={categorie}
              setCategorie={setCategorie}
            />

            <Field
              label="Montant"
              value={montant} onChangeText={setMontant}
              placeholder="Ex: 25,00"
            />

            <Field
              label="Devise"
              value={devise}
              onChangeText={setDevise}
              placeholder="Ex: EUR"
            />

            <Field
              label="Observation"
              value={observation}
              onChangeText={setObservation}
              multiline
              placeholder="Ex: PAYÉ, mode de paiement..."
            />

            <InputDate
              label="Date"
              value={date}
              onChange={setDate}
              placeholder="Ex: 01/01/2023"
            />

          </View>

          <View style={{ flexDirection: "column", alignItems: 'stretch', justifyContent: 'center', gap: 1, marginBottom: 16 }}>
            <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: error.produits ? "red" : border, marginBottom: 0, padding: 12 }]}>
              <View style={styles.itemsHeader}>
                <Text style={[styles.section, { color: sectionColor }]}>
                  Produits ({items.length})
                </Text>
                {items.length > 0 && (
                  <Text style={[styles.itemsTotal, { color: labelColor }]}>
                    Total :{" "} {formatCompactNumber(Number(itemsTotal), devise)}
                  </Text>
                )}
              </View>

              {items.map((item, index) => (
                <View
                  key={index}
                  style={[styles.itemCard, { borderColor: border, backgroundColor: inputBg, position: "relative" }]}
                >
                  <TouchableOpacity
                    onPress={() => removeItem(index)}
                    style={[styles.iconButton, styles.removeButton, { position: 'absolute', zIndex: 1, top: -10, right: -8, backgroundColor: dangerColor, borderWidth: 1, borderColor: border }]}
                  >
                    <Trash2 color={"white"} size={18} />
                  </TouchableOpacity>

                  <Field
                    label="Nom du produit *"
                    value={item.name}
                    onChangeText={(v) => updateItem(index, { name: v })}
                    placeholder="Ex : Riz"
                    compact
                    error={error[`items.${index}.name`]}
                    onFocus={() => setError({ ...error, [`items.${index}.name`]: "" })}
                  />

                  <View style={styles.itemNumbersRow}>
                    <Field
                      label="Quantité"
                      value={String(item.quantity)}
                      onChangeText={(v) => updateItem(index, { quantity: Number(v), total_price: Number(v) * Number(item.unit_price) })}
                      placeholder="1"
                      keyboardType="numeric"
                      style={{ flex: 1, marginRight: 8 }}
                      compact
                      error={error[`items.${index}.quantity`]}
                      onFocus={() => setError({ ...error, [`items.${index}.quantity`]: "" })}
                    />

                    <SelectChipsMenu
                      data={UNITE}
                      value={item?.unit || ""}
                      setValue={(e) => updateItem(index, { unit: e })}
                      position={{ top: 60, right: 0, width: DIMENSION.width - 70 }}
                      style={{ width: "35%" }}
                    />
                  </View>

                  <Field
                    label="Prix unitaire"
                    value={(Number(item.unit_price) || 0).toString()}
                    onChangeText={(v) => updateItem(index, { unit_price: Number(v), total_price: Number(v) * Number(item.quantity) })}
                    placeholder="0"
                    keyboardType="numeric"
                    style={{ flex: 1 }}
                    compact
                    error={error[`items.${index}.unit_price`]}
                    onFocus={() => setError({ ...error, [`items.${index}.unit_price`]: "" })}
                  />

                  <Text style={[styles.itemLineTotal, { color: sectionColor }]}>
                    ={" "}
                    {formatCompactNumber(Number(item.unit_price) * Number(item.quantity), devise)}
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addItemButton, { borderColor: sectionColor }]}
                onPress={addItem}
              >
                <Plus color={sectionColor} size={16} style={{ marginRight: 6 }} />
                <Text style={[styles.buttonText, { color: sectionColor }]}>
                  Ajouter un produit
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: dangerColor }}>{error.produits}</Text>
          </View>

          <TouchableOpacity style={[styles.miniButton, { backgroundColor: sectionColor }]} onPress={handleConfirm}>
            <Text style={[styles.buttonText, { color: "white" }]}>Valider</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
