import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ToastAndroid,
} from 'react-native';
import { styles } from '@/styles/styles';
import { useAppColors } from '@/hooks/useAppColors';
import Field from '@/components/input/InputText';
import { Depense, DepenseItem } from '@/types/db';
import InputDate from '@/components/input/input-date';
import { setDepense, setDepenses } from '@/controller/depense.controller';
import { router } from 'expo-router';
import { toISODate } from '@/utils/date.util';
import EmptyData from '@/components/ui/empty-data';
import { Plus, Trash2, WifiOff } from 'lucide-react-native';
import { CATEGORIES, DIMENSION, UNITE } from '@/constants/type';
import { formatCompactNumber } from '@/utils/number.util';
import { sendNotification } from '@/services/notificationService';
import { MainHeader } from '@/components/header/header-main';
import { DetailHeader } from '../(detail)/_layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAppNet } from '@/hooks/useAppNet';
import { scanReceiptOffline, sendDataToScan } from '@/utils/scan.ticket.util';
import { setProvisions } from '@/controller/provision.controller';
import SelectChips from '@/components/input/select-chips';
import InputImage from '@/components/input/input-image';
import SelectChipsMenu from '@/components/input/select-chips-menu';
import { useNotifications } from '@/contexts/NotificationContext';

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
  const { isOnline } = useAppNet();
  const { user } = useAuth();
  const [categories, setCategories] = useState(CATEGORIES);
  const { addNotification } = useNotifications();

  const itemsTotal = items.reduce((total, item) => total + (parseFloat(item.unit_price?.toString()) * parseFloat(item.quantity?.toString()) || 0), 0);

  useEffect(() => {
    setMontant(itemsTotal.toString());
  }, [itemsTotal]);

  const handleScan = async (uri: string) => {
    if (!uri) {
      setImage("");
      return;
    }

    setImage(uri);
    setLoading(true);
    try {
      const result = isOnline ? await sendDataToScan(uri) : await scanReceiptOffline(uri);
      const parsedResult = typeof result === "string" ? JSON.parse(result) : result;
      const depenses = parsedResult.depense ?? [];
      const provisions = parsedResult.provision ?? [];

      if (depenses.length === 0) {
        throw new Error("Aucune dépense détectée dans la réponse");
      }

      if (depenses.length > 1) {
        if (provisions.length > 0) { await setProvisions(provisions); }
        const res = await setDepenses(depenses);
        const parsedResponse = JSON.parse(res);
        if (parsedResponse.success) {
          await sendNotification({
            title: "💰 Nouvelle dépense ajoutée",
            body: `${parsedResponse.newDepenses.length} nouvelles dépenses ont été ajoutées avec le scan du ticket !`,
            route: "/(detail)/detail-shopping",
            params: { id: parsedResponse.newDepenses[0].id, },
          });
          await addNotification({
            type: "depense_new",
            title: "💰 Nouvelle dépense ajoutée",
            message: `${parsedResponse.newDepenses.length} nouvelles dépenses ont été ajoutées avec le scan du ticket !`,
            data: { id: parsedResponse.newDepenses[0].id, pathName: "/(detail)/detail-shopping", },
          });
          ToastAndroid.show(parsedResponse.message, ToastAndroid.SHORT);
          router.push({ pathname: "/(tabs)", });
          return;
        }

        throw new Error(
          parsedResponse.message ??
          "Erreur lors de l'enregistrement"
        );
      }

      const premiereDepense = depenses[0];

      const existingCategories = CATEGORIES.filter(cat => cat === premiereDepense.categorie);
      if (existingCategories.length === 0) {
        setCategories([...CATEGORIES, premiereDepense.categorie]);
      }

      setMontant(String(premiereDepense.montant ?? ""));
      setDevise(parsedResult.devise ?? "AR");
      setDate(premiereDepense.date ?? toISODate(new Date()));
      setMerchant(parsedResult.merchant ?? "");
      setObservation(parsedResult.observation ?? "");
      setCategorie(premiereDepense.categorie ?? "Autre");

      const depenseItems =
        (premiereDepense.items ?? []).map(
          (item: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            name: item.name ?? "",
            quantity: item.quantity ?? 1,
            unit: item.unit ?? "piece",
            unit_price: item.unit_price ?? 0,
            total_price: item.total_price ?? 0,
            image: uri,
          })
        );

      setItems(depenseItems);

    } catch (error) {
      console.warn("Scan error:", error);

      Alert.alert(
        "Erreur",
        "Impossible de lire le ticket. Réessayez avec une photo plus nette."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!montant) {
      Alert.alert('Montant requis', 'Veuillez indiquer un montant avant de valider.');
      return;
    }

    const depense: Depense = {
      id: Date.now().toString(),
      user_id: user?.id || '',
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
    <MainHeader
      height={100}
      header={() => <DetailHeader title="Scan du ticket" />}
    >
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

            <SelectChips
              label="Categorie"
              data={categories}
              value={categorie}
              setValue={setCategorie}
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
                    style={[styles.iconButton, styles.removeButton, { position: 'absolute', zIndex: 1, top: -15, right: -8, backgroundColor: dangerColor, borderWidth: 1, borderColor: border, padding: 6 }]}
                  >
                    <Trash2 color={"white"} size={20} />
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
    </MainHeader>
  );
}
