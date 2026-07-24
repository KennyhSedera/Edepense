import { View, Text, ToastAndroid, Pressable, Image } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import { styles } from '@/styles/styles';
import { deleteProvision, getProvisionById } from '@/controller/provision.controller';
import { router, useFocusEffect } from 'expo-router';
import DeleteModal from '@/components/modal/DeleteModal';
import MenuModal from '@/components/modal/menu-modal';
import MenuButton, { MenuItem } from '@/components/input/MenuButton';
import Field from '@/components/input/InputText';
import { LucideEdit, Trash2, MinusCircle, PlusCircle, History } from 'lucide-react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { useNotifications } from '@/contexts/NotificationContext';
import { MiniCard } from '@/app/(detail)/detail-shopping';
import { Provision } from '@/types/db';
import { formatMoney } from '@/utils/number.util';
import { formatDateLong } from '@/utils/date.util';
import { depenseCoverImage } from '@/constants/image';
import { getUnitLabel } from '@/constants/type';
import RenderImage from '@/components/modal/render-image';
import { MainHeader } from '@/components/header/header-main';
import { DetailHeader } from '@/app/(detail)/_layout';
import SelectChipsMenu from '@/components/input/select-chips-menu';
import { getUnitesCompatibles } from '@/utils/unit.conversion.util';
import { getJoursRestants, logSortie, ajouterEntreeManuelle } from '@/controller/provision.mouvement.controller';
import { useAuth } from '@/contexts/AuthContext';

export default function DetailProvision() {
  const { textColor, backgroundColor, border, labelColor, dangerColor, sectionColor, cardBg, successColor } = useAppColors();
  const { addNotification } = useNotifications();
  const { id }: { id: string } = useLocalSearchParams();
  const [data, setData] = useState<Provision | null>(null);
  const [showImage, setShowImage] = useState(false);
  const [prixAjout, setPrixAjout] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });

  // --- consommation (sortie) ---
  const [showConsommerModal, setShowConsommerModal] = useState(false);
  const [qteConsommee, setQteConsommee] = useState("");
  const [errorConso, setErrorConso] = useState("");
  const [joursRestants, setJoursRestants] = useState<number | null>(null);
  const [uniteConso, setUniteConso] = useState(data?.unite || "");

  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [qteAjoutee, setQteAjoutee] = useState("");
  const [errorAjout, setErrorAjout] = useState("");
  const [uniteAjout, setUniteAjout] = useState(data?.unite || "");

  const { user } = useAuth();

  async function loadData(id: string) {
    const data = await getProvisionById(id);
    setData(data);
    if (data.quantite_restante === 0) {
      ToastAndroid.show(`${data?.nom} : stock épuisé !`, ToastAndroid.LONG);
    }
    if (data) {
      const jours = await getJoursRestants(data);
      setJoursRestants(jours);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData(id);
    }, [id],)
  )

  const handleDelete = async (action?: string, id?: string) => {
    if (!action || !id) {
      setConfirmDelete({ show: false, id: "", message: "" });
      return;
    }

    if (action === "delete") {
      const res = await deleteProvision(id);
      const data = JSON.parse(res);
      if (data.success) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        loadData(id);
        router.back();
        setConfirmDelete({ show: false, id: "", message: "" });
      }
    }

    setConfirmDelete({ show: false, id: "", message: "" });
  }

  React.useEffect(() => {
    if (data?.unite) {
      setUniteConso(data.unite);
      setUniteAjout(data.unite);
    }
  }, [data?.unite]);

  const handleConsommer = async () => {
    const quantite = Number(qteConsommee);

    if (!quantite || quantite <= 0) {
      setErrorConso("Quantité invalide");
      return;
    }

    if (!uniteConso) {
      setErrorConso("Unite invalide");
      return;
    }

    if (data && (quantite > data?.quantite_restante)) {
      setErrorConso("Quantité insuffisante");
      return;
    }

    try {
      const res = await logSortie(id, quantite, uniteConso);
      const result = JSON.parse(res);

      if (!result.success) {
        setErrorConso(result.message);
        return;
      }

      setData(result.provision);
      setJoursRestants(result.joursRestants);
      setQteConsommee("");
      setErrorConso("");
      setShowConsommerModal(false);

      ToastAndroid.show("Consommation enregistrée", ToastAndroid.SHORT);

      if (result.alerteDeclenchee) {
        await addNotification({
          type: "provision_alert",
          title: "Stock bas",
          message: `Il ne reste plus que ${result.joursRestants?.toFixed(1)} jour(s) de "${data?.nom}"`,
          data: { pathName: "/detail-provision", id },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAjouterStock = async () => {
    const quantite = Number(qteAjoutee);
    const prix = prixAjout ? Number(prixAjout) : undefined;

    if (!quantite || quantite <= 0) {
      setErrorAjout("Quantité invalide");
      return;
    }

    if (!uniteAjout) {
      setErrorAjout("Unité invalide");
      return;
    }

    if (prixAjout && (isNaN(prix as number) || (prix as number) <= 0)) {
      setErrorAjout("Prix invalide");
      return;
    }

    try {
      const res = await ajouterEntreeManuelle(id, quantite, uniteAjout, prix);
      const result = JSON.parse(res);

      if (!result.success) {
        setErrorAjout(result.message);
        return;
      }

      setData(result.provision);
      setJoursRestants(result.joursRestants);
      setQteAjoutee("");
      setPrixAjout("");
      setErrorAjout("");
      setShowAjoutModal(false);

      if (result.variationPrix !== 0) {
        const sens = result.variationPrix > 0 ? "augmenté" : "diminué";
        ToastAndroid.show(`Stock ajouté (prix ${sens} par rapport au précédent)`, ToastAndroid.LONG);
      } else {
        ToastAndroid.show("Stock ajouté avec succès", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MainHeader
      height={100}
      header={() => <DetailHeader title="Détail de la provision" />}
    >
      <DeleteModal onChange={handleDelete} visible={confirmDelete.show} message={confirmDelete.message} id={data?.id} />

      <RenderImage
        value={data?.image}
        onChange={setShowImage}
        visible={showImage}
      />

      <View>
        <MenuButton position={{ top: 5, right: 5 }}>
          <MenuItem onPress={() => { setShowAjoutModal(true); setPrixAjout(data?.prix_unitaire.toString() || "") }}>
            <PlusCircle size={18} color={successColor} />
            <Text style={{ color: successColor, fontSize: 15 }}>Ajouter du stock</Text>
          </MenuItem>
          <View style={{ height: 1, backgroundColor: border }} />
          {data && data?.quantite_restante > 0 && <MenuItem onPress={() => setShowConsommerModal(true)}>
            <MinusCircle size={18} color={textColor} />
            <Text style={{ color: textColor, fontSize: 15 }}>Consommer</Text>
          </MenuItem>}
          <View style={{ height: 1, backgroundColor: border }} />
          <MenuItem onPress={() => router.push({ pathname: '/historique-provision', params: { id: data?.id } })}>
            <History size={18} color={textColor} />
            <Text style={{ color: textColor, fontSize: 15 }}>Voir l'historique</Text>
          </MenuItem>
          <View style={{ height: 1, backgroundColor: border }} />
          <MenuItem
            onPress={() => router.push({ pathname: '/provision-form', params: { id: data?.id } })}
          >
            <LucideEdit size={18} color={textColor} />
            <Text style={{ color: textColor, fontSize: 15 }}>Modifier</Text>
          </MenuItem>
          <View style={{ height: 1, backgroundColor: border }} />
          <MenuItem
            onPress={() => setConfirmDelete({ show: true, id: data?.id || "", message: `Voulez-vous vraiment supprimer la provision "${data?.nom}" ?` })}
          >
            <Trash2 size={18} color={dangerColor} />
            <Text style={{ color: dangerColor, fontSize: 15 }}>Supprimer</Text>
          </MenuItem>
        </MenuButton>
        <Image
          source={data?.image ? { uri: data.image } : depenseCoverImage(data?.categorie || "Autre")}
          resizeMode='cover'
          style={[{ borderRadius: 9, width: "100%", height: 250, marginBottom: 15 }]}
        />
      </View>

      {data && data?.quantite_restante === 0 && (
        <View style={{ alignItems: "center", marginBottom: 15 }}>
          <Text style={[styles.text, { color: dangerColor }]}>Cette provision est totalement consommée (Stock épuisé)</Text>
        </View>
      )}

      {/* INFOS */}
      <View style={styles.infoGrid}>
        <MiniCard
          label="Nom du provision"
          value={data?.nom as string || ""}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridFull}
        />
        <MiniCard
          label="Catégorie"
          value={data?.categorie as string || ""}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridFull}
        />
        <MiniCard
          label="Quantité initiale"
          value={`${data?.quantite_initiale as number ?? ""} ${getUnitLabel(data?.unite as string)}`}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />
        <MiniCard
          label="Quantité restante"
          value={`${data?.quantite_restante as number ?? ""} ${getUnitLabel(data?.unite as string)}`}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />
        <MiniCard
          label="Jours restants estimés"
          value={joursRestants !== null ? `≈ ${Math.floor(joursRestants)} jour(s)` : "Indisponible"}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridFull}
        />
        <MiniCard
          label="Prix unitaire"
          value={`${formatMoney(data?.prix_unitaire as number, user?.devise || "MGA") ?? ""} `}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />
        <MiniCard
          label="Prix total"
          value={`${formatMoney(data?.prix_total as number, user?.devise || "MGA") ?? ""}`}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />
        <MiniCard
          label="Date d'achat"
          value={formatDateLong(data?.date_achat as string || "")}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridFull}
        />
      </View>

      {/* MODAL CONSOMMATION (sortie) */}
      <MenuModal
        visible={showConsommerModal}
        onChange={() => { setShowConsommerModal(false); setErrorConso(""); setQteConsommee(""); }}
      >
        <View style={{ gap: 10, paddingTop: 10 }}>
          <Text style={{ fontWeight: "700", color: textColor, fontSize: 15 }}>
            Enregistrer une consommation
          </Text>
          <Text style={{ color: labelColor, fontSize: 13 }}>
            Stock restant : {data?.quantite_restante} {getUnitLabel(data?.unite as string)}
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Field
              label="Quantité utilisée"
              value={qteConsommee}
              onChangeText={setQteConsommee}
              placeholder="Ex: 200"
              keyboardType="numeric"
              error={errorConso}
              onFocus={() => setErrorConso("")}
              style={{ flex: 1 }}
            />

            <SelectChipsMenu
              data={getUnitesCompatibles(data?.unite || "")}
              value={uniteConso}
              setValue={setUniteConso}
              style={{ width: 100 }}
              position={{ top: 56, right: 0, width: 120 }}
            />
          </View>

          <Pressable
            style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
            onPress={handleConsommer}
          >
            <MinusCircle size={18} color="#fff" />
            <Text style={styles.buttonText}>Confirmer</Text>
          </Pressable>
        </View>
      </MenuModal>

      {/* MODAL AJOUT DE STOCK (entrée) */}
      <MenuModal
        visible={showAjoutModal}
        onChange={() => { setShowAjoutModal(false); setErrorAjout(""); setQteAjoutee(""); setPrixAjout(""); }}
      >
        <View style={{ gap: 10, paddingTop: 10 }}>
          <Text style={{ fontWeight: "700", color: textColor, fontSize: 15 }}>
            Ajouter du stock
          </Text>
          <Text style={{ color: labelColor, fontSize: 13 }}>
            Stock actuel : {data?.quantite_restante} {getUnitLabel(data?.unite as string)} — Prix unitaire actuel : {formatMoney(data?.prix_unitaire as number, user?.devise || "MGA")}
          </Text>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Field
              label="Quantité ajoutée"
              value={qteAjoutee}
              onChangeText={setQteAjoutee}
              placeholder="Ex: 500"
              keyboardType="numeric"
              error={errorAjout}
              onFocus={() => setErrorAjout("")}
              style={{ flex: 1 }}
            />

            <SelectChipsMenu
              data={getUnitesCompatibles(data?.unite || "")}
              value={uniteAjout}
              setValue={setUniteAjout}
              style={{ width: 100 }}
              position={{ top: 56, right: 0, width: 120 }}
            />
          </View>

          <Field
            label={`Nouveau prix unitaire (optionnel, sinon garde ${formatMoney(data?.prix_unitaire as number, user?.devise || "MGA")})`}
            value={prixAjout}
            onChangeText={setPrixAjout}
            placeholder="Laisser vide si prix inchangé"
            keyboardType="numeric"
          />

          <Pressable
            style={[styles.miniButton, { backgroundColor: successColor, marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
            onPress={handleAjouterStock}
          >
            <PlusCircle size={18} color="#fff" />
            <Text style={styles.buttonText}>Confirmer</Text>
          </Pressable>
        </View>
      </MenuModal>
    </MainHeader>
  )
}