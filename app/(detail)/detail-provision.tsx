import { View, Text, ToastAndroid, Pressable, Image } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import { styles } from '@/styles/styles';
import { deleteProvision, getProvisionById } from '@/controller/provision.controller';
import { logConsommation, getJoursRestants } from '@/controller/provisionConsommation.controller';
import { router, useFocusEffect } from 'expo-router';
import DeleteModal from '@/components/modal/DeleteModal';
import MenuModal from '@/components/modal/menu-modal';
import MenuButton, { MenuItem } from '@/components/input/MenuButton';
import Field from '@/components/input/InputText';
import { LucideEdit, Trash2, MinusCircle } from 'lucide-react-native';
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

export default function DetailProvision() {
  const { textColor, backgroundColor, border, labelColor, dangerColor, sectionColor, cardBg } = useAppColors();
  const { addNotification } = useNotifications();
  const { id }: { id: string } = useLocalSearchParams();
  const [data, setData] = useState<Provision | null>(null);
  const [showImage, setShowImage] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: "",
    message: "",
  });

  const [showConsommerModal, setShowConsommerModal] = useState(false);
  const [qteConsommee, setQteConsommee] = useState("");
  const [errorConso, setErrorConso] = useState("");
  const [joursRestants, setJoursRestants] = useState<number | null>(null);

  async function loadData(id: string) {
    const data = await getProvisionById(id);
    setData(data);

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

  const handleConsommer = async () => {
    const quantite = Number(qteConsommee);

    if (!quantite || quantite <= 0) {
      setErrorConso("Quantité invalide");
      return;
    }
    if (data && quantite > data.quantite_restante) {
      setErrorConso("Quantité supérieure au stock restant");
      return;
    }

    try {
      const res = await logConsommation(id, quantite);
      const result = JSON.parse(res);

      if (!result.success) {
        ToastAndroid.show(result.message, ToastAndroid.SHORT);
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
          <MenuItem onPress={() => setShowConsommerModal(true)}>
            <MinusCircle size={18} color={textColor} />
            <Text style={{ color: textColor, fontSize: 15 }}>Consommer</Text>
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
          source={data?.image ? { uri: data.image } : depenseCoverImage("Alimentation")}
          resizeMode='cover'
          style={[{ borderRadius: 9, width: "100%", height: 250, marginBottom: 15 }]}
        />
      </View>

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
          value={`${formatMoney(data?.prix_unitaire as number) ?? ""} `}
          backgroundColor={backgroundColor}
          border={border}
          labelColor={labelColor}
          textColor={textColor}
          style={styles.infoGridHalf}
        />
        <MiniCard
          label="Prix total"
          value={`${formatMoney(data?.prix_total as number) ?? ""} `}
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

          <Field
            label={`Quantité utilisée (${getUnitLabel(data?.unite as string)})`}
            value={qteConsommee}
            onChangeText={setQteConsommee}
            placeholder="Ex: 1"
            keyboardType="numeric"
            error={errorConso}
            onFocus={() => setErrorConso("")}
          />

          <Pressable
            style={[styles.miniButton, { backgroundColor: sectionColor, marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }]}
            onPress={handleConsommer}
          >
            <MinusCircle size={18} color="#fff" />
            <Text style={styles.buttonText}>Confirmer</Text>
          </Pressable>
        </View>
      </MenuModal>
    </MainHeader>
  )
}