import InputImage from "@/components/ui/input-image";
import Field from "@/components/ui/InputText";
import SelectChips from "@/components/ui/select-chips";
import SelectChipsMenu from "@/components/ui/select-chips-menu";
import { CATEGORIES_PROVISION, DIMENSION, UNITE } from "@/constants/type";
import { getProvisionById, setProvision, updateProvision } from "@/db/provision";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import { Provision } from "@/types/db";
import { toISODate } from "@/utils/dateFormat";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ToastAndroid,
} from "react-native";

export default function ProvisionForm() {
  const [data, setData] = useState<Provision>({
    id: Date.now().toString(),
    nom: "",
    quantite_initiale: 1,
    quantite_restante: 1,
    date_achat: toISODate(new Date()),
    prix_total: 0,
    prix_unitaire: 0,
    unite: "kg",
    categorie: "légumes",
    image: "",
    created_at: toISODate(new Date()),
  });
  const [qteRestant, setQteRestant] = useState(0);
  const [qteInitiale, setQteInitiale] = useState(0);

  const [error, setError] = useState<Record<string, string>>({});

  const params = useLocalSearchParams();

  const id = params?.id as string;

  const loadData = async (id: string) => {
    const d = await getProvisionById(id);
    setData({
      ...data,
      id,
      nom: d?.nom || "",
      quantite_restante: d?.quantite_restante || 0,
      quantite_initiale: d?.quantite_initiale || 0,
      unite: d?.unite || "",
      prix_total: d?.quantite_initiale * d?.prix_unitaire,
      prix_unitaire: d?.prix_unitaire,
      image: d?.image
    });
    setQteRestant(d?.quantite_restante || 0);
    setQteInitiale(d?.quantite_initiale || 0);
  }

  React.useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const { sectionColor, border, cardBg, inputBg, textColor } = useAppColors();

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!data.nom) {
      errors.nom = "Le nom est requis";
    }
    if (!data.quantite_initiale) {
      errors.quantite_initiale = "La quantité est requise";
    }
    if (!data.unite) {
      errors.unite = "L'unité est requise";
    }
    if (!data.prix_unitaire) {
      errors.prix_unitaire = "Le prix unitaire est requis";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (errors) {
      setError(errors);
      return;
    }

    const qte = Number(data.quantite_initiale);
    const qte_restant = id ? (qteInitiale > data.quantite_initiale ? qteRestant - (qteInitiale - data.quantite_initiale) : qteInitiale < data.quantite_initiale ? qteRestant + (data.quantite_initiale - qteInitiale) : qteRestant) : data.quantite_initiale
    const prix = Number(data.prix_unitaire);

    const provision = {
      id: id ? id : Date.now().toString(),
      nom: data.nom,
      quantite_initiale: qte,
      quantite_restante: qte_restant,
      unite: data.unite,
      image: data.image,
      prix_unitaire: prix,
      prix_total: qte * prix,
      date_achat: new Date().toISOString(),
      created_at: new Date().toISOString(),
      consommation_estimee_par_jour: 0,
      categorie: data.categorie,
    };

    try {
      let res = "";
      if (id) {
        res = await updateProvision(provision, id);
      } else {
        res = await setProvision(provision);
      }

      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        router.back();
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView style={[styles.container, { padding: 12 }]} contentContainerStyle={{ paddingBottom: 12 }}>
      <View style={[styles.form, { borderColor: border, borderWidth: 1, backgroundColor: cardBg }]}>
        <InputImage value={data.image} setValue={(e) => setData({ ...data, image: e })} />
      </View>
      <View style={[styles.form, { borderColor: border, borderWidth: 1, backgroundColor: cardBg }]}>
        <Field
          label="Nom du produit"
          value={data?.nom}
          onChangeText={(e) => setData({ ...data, nom: e })}
          placeholder="Ex: riz ..."
          error={error.nom}
          onFocus={() => setError({ ...error, nom: '' })}
        />

        <SelectChips
          label="Catégorie"
          data={CATEGORIES_PROVISION}
          value={data.categorie}
          setValue={(c) => setData({ ...data, categorie: c })}
        />

        <View style={[styles.infoGrid]}>
          <Field
            label="Quantité"
            value={data.quantite_initiale.toString()}
            onChangeText={(e) => setData({ ...data, quantite_initiale: Number(e) })}
            placeholder="Quantité"
            keyboardType="numeric"
            error={error.quantite_initiale}
            style={styles.infoGridHalf}
            onFocus={() => setError({ ...error, quantite_initiale: '' })}
          />

          <SelectChipsMenu
            data={UNITE}
            value={data.unite}
            setValue={(e) => setData({ ...data, unite: e })}
            style={styles.infoGridHalf}
            position={{ top: 56, right: 0, width: DIMENSION.width - 58 }}
          />
        </View>

        <Field
          label="Prix unitaire"
          value={data.prix_unitaire.toString()}
          onChangeText={(e) => setData({ ...data, prix_unitaire: Number(e) })}
          placeholder="Prix unitaire"
          keyboardType="numeric"
          error={error.prix_unitaire}
          onFocus={() => setError({ ...error, prix_unitaire: '' })}
        />

        <Field
          label="Prix total"
          value={(data.prix_unitaire * data.quantite_initiale).toString()}
          readOnly
          error={error.prix_total}
          onFocus={() => setError({ ...error, prix_total: '' })}
        />

      </View>

      <Pressable style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 22 }]} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </Pressable>
    </ScrollView>
  );
}
