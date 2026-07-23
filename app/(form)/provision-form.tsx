import { MainHeader } from "@/components/header/header-main";
import InputImage from "@/components/input/input-image";
import Field from "@/components/input/InputText";
import SelectChips from "@/components/input/select-chips";
import SelectChipsMenu from "@/components/input/select-chips-menu";
import { CATEGORIES_PROVISION, DIMENSION, UNITE } from "@/constants/type";
import { getProvisionById, setProvision, updateProvision } from "@/controller/provision.controller";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import { Provision } from "@/types/db";
import { toISODate } from "@/utils/date.util";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ToastAndroid,
} from "react-native";
import { FormHeader } from "./_layout";
import { setDepense } from "@/controller/depense.controller";
import { useAuth } from "@/contexts/AuthContext";

export default function ProvisionForm() {
  const { user } = useAuth();
  const [data, setData] = useState<Provision>({
    id: Date.now().toString(),
    user_id: user?.id || "",
    nom: "",
    quantite_initiale: 1,
    quantite_restante: 1,
    date_achat: toISODate(new Date()),
    prix_total: 0,
    prix_unitaire: 0,
    unite: "kg",
    categorie: "Légumes",
    image: "",
    consommation_estimee_par_jour: undefined,
    created_at: toISODate(new Date()),
  });
  const [qteRestant, setQteRestant] = useState(0);
  const [qteInitiale, setQteInitiale] = useState(0);

  const [qteInitialeText, setQteInitialeText] = useState("1");
  const [prixUnitaireText, setPrixUnitaireText] = useState("0");
  const [consommationText, setConsommationText] = useState("");

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
      image: d?.image,
      consommation_estimee_par_jour: d?.consommation_estimee_par_jour,
      categorie: d?.categorie,
    });
    setQteRestant(d?.quantite_restante || 0);
    setQteInitiale(d?.quantite_initiale || 0);

    setQteInitialeText(d?.quantite_initiale?.toString() || "0");
    setPrixUnitaireText(d?.prix_unitaire?.toString() || "0");
    setConsommationText(d?.consommation_estimee_par_jour?.toString() || "");
  }

  React.useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const { sectionColor, border, cardBg, labelColor } = useAppColors();

  const sanitizeDecimal = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!data.nom) {
      errors.nom = "Le nom est requis";
    }
    if (!qteInitialeText || Number(qteInitialeText) <= 0) {
      errors.quantite_initiale = "La quantité est requise";
    }
    if (!data.unite) {
      errors.unite = "L'unité est requise";
    }
    if (!prixUnitaireText || Number(prixUnitaireText) <= 0) {
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

    const qte = Number(qteInitialeText);
    const prix = Number(prixUnitaireText);
    const consommationEstimee = consommationText ? Number(consommationText) : undefined;
    const isEdit = !!id;

    const deltaQte = isEdit ? qte - qteInitiale : qte;

    const qte_restant = isEdit
      ? qteRestant + (qte - qteInitiale)
      : qte;

    const provision = {
      id: id ?? Date.now().toString(),
      user_id: user?.id || "",
      nom: data.nom,
      quantite_initiale: qte,
      quantite_restante: qte_restant,
      unite: data.unite,
      image: data.image,
      prix_unitaire: prix,
      prix_total: qte * prix,
      date_achat: new Date().toISOString(),
      created_at: new Date().toISOString(),
      consommation_estimee_par_jour: consommationEstimee,
      categorie: data.categorie,
    };

    const montant = deltaQte * prix;
    const depense = {
      user_id: user?.id || "",
      id: Date.now().toString(),
      categorie: provision.categorie,
      montant,
      description: `Achat de ${deltaQte} ${provision.unite} de ${provision.nom} pour un prix unitaire de ${prix}.`,
      date: new Date().toISOString().split("T")[0],
      items: [{ id: Date.now().toString(), name: provision.nom, quantity: deltaQte, unit: provision.unite, unit_price: prix, total_price: montant }],
    }

    try {
      const res = isEdit
        ? await updateProvision(provision, id)
        : await setProvision(provision);

      const result = JSON.parse(res);
      if (!result.success) return;

      if (deltaQte > 0) {
        await setDepense(depense);
      }

      ToastAndroid.show(result.message, ToastAndroid.SHORT);
      router.back();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MainHeader
      height={100}
      header={() => <FormHeader title="Formulaire de provision" />}
    >
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
            label="Quantité"
            value={qteInitialeText}
            onChangeText={(e) => setQteInitialeText(sanitizeDecimal(e))}
            placeholder="Quantité"
            keyboardType="decimal-pad"
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
          value={prixUnitaireText}
          onChangeText={(e) => setPrixUnitaireText(sanitizeDecimal(e))}
          placeholder="Prix unitaire"
          keyboardType="decimal-pad"
          error={error.prix_unitaire}
          onFocus={() => setError({ ...error, prix_unitaire: '' })}
        />

        <Field
          label="Prix total"
          value={((Number(qteInitialeText) || 0) * (Number(prixUnitaireText) || 0)).toString()}
          readOnly
          error={error.prix_total}
          onFocus={() => setError({ ...error, prix_total: '' })}
        />

        <Field
          label="Consommation estimée par jour (optionnel)"
          value={consommationText}
          onChangeText={(e) => setConsommationText(sanitizeDecimal(e))}
          placeholder={`Ex: 0.5 ${data.unite}/jour`}
          keyboardType="decimal-pad"
        />
        <Text style={{ color: labelColor, fontSize: 12, marginTop: -8 }}>
          Sert uniquement d'estimation de départ tant qu'il n'y a pas encore d'historique de consommation réelle.
        </Text>

      </View>

      <Pressable style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 22 }]} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </Pressable>
    </MainHeader>
  );
}