import { View, Text, Image, ScrollView, Pressable, ToastAndroid, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { MainHeader } from '@/components/header/header-main'
import { HeaderWithSearch } from '../(guest)/_layout'
import FooterTypeMessenger from '@/components/footer/footer-type-messenger'
import { useAppColors } from '@/hooks/useAppColors'
import { Action, Message } from '@/types/db'
import useVoiceRecord from '@/hooks/useVoiceRecord'
import { LecteurAudioMessage } from '@/components/audio/LecteurAudioMessage'
import { getMessagesPaginated, removeAllMessageByUId, removeMessage, removeMessages, sendMessage, updateMessage } from '@/controller/message.controller'
import { router, useFocusEffect } from 'expo-router'
import EmptyData from '@/components/ui/empty-data'
import { Check, ChevronDown, Copy, Edit, Eye, MessageCircleIcon, MessageCircleOffIcon, Trash2Icon, X } from 'lucide-react-native'
import { analyseText, extraireTexteEtJson } from '@/utils/depense.util'
import MenuModal from '@/components/modal/menu-modal'
import { styles } from '@/styles/styles'
import { copierTexte } from '@/utils/text.util'
import ThreeDotsLoader from '@/components/ui/dot-animed'
import { setProvisions } from '@/controller/provision.controller'
import { setDepenses } from '@/controller/depense.controller'
import { formatDateStringForDisplay } from '@/utils/date.util'
import { useAuth } from '@/contexts/AuthContext'
import { FloatingActionButton, useScrollFab } from '@/components/input/floating-action-button'
import { scanReceiptOffline, scanText, sendDataToScan } from '@/utils/scan.ticket.util'
import { PAGE_SIZE } from '@/constants/type'
import RenderImage from '@/components/modal/render-image'
import { useAppNet } from '@/hooks/useAppNet'

export default function TypeWhatsapp() {
  const { user } = useAuth();
  const { transcribeText } = useVoiceRecord();
  const { translateY, onScroll, opacity } = useScrollFab("show-when-scrolled-up");
  const { textColor, backgroundColor, dangerColor, labelColor, sectionColor, successColor } = useAppColors();
  const [message, setMessage] = React.useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const [isTyping, setIsTyping] = React.useState(false);
  const [text, setText] = React.useState("");
  const [image, setImage] = React.useState("");
  const [textToResponse, setTextToResponse] = React.useState<Message | null>(null);
  const [showImage, setShowImage] = React.useState(false);

  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [offset, setOffset] = React.useState(0);
  const [globalSelect, setGlobalSelect] = React.useState(false);

  const pendingScrollToEndRef = useRef(false);
  const isPrependingRef = useRef(false);
  const suppressNextEffectRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const isLoadingMoreRef = useRef(false);

  const { isOnline } = useAppNet();

  useEffect(() => {
    if (suppressNextEffectRef.current) {
      suppressNextEffectRef.current = false;
      return;
    }
    pendingScrollToEndRef.current = true;
  }, [message]);

  async function loadMoreMessages() {
    if (isLoadingMoreRef.current || !hasMore) return;
    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    isPrependingRef.current = true;
    suppressNextEffectRef.current = true;

    try {
      const older = await getMessagesPaginated(offset, PAGE_SIZE);
      if (!older || older.length === 0) {
        setHasMore(false);
        isPrependingRef.current = false;
        suppressNextEffectRef.current = false;
        return;
      }
      setMessage((prev) => [...older, ...prev]);
      setOffset((prev) => prev + older.length);
      setHasMore(older.length === PAGE_SIZE);
    } catch (error) {
      console.error(error);
      isPrependingRef.current = false;
      suppressNextEffectRef.current = false;
    } finally {
      setLoadingMore(false);
      isPrependingRef.current = false;
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 3000);
    }
  }

  function handleScroll(event: any) {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y < 100 && !isLoadingMoreRef.current && hasMore) {
      loadMoreMessages();
    }
    onScroll(event);
  }

  function handleContentSizeChange(w: number, h: number) {
    if (pendingScrollToEndRef.current && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: !isInitialLoadRef.current });
      pendingScrollToEndRef.current = false;
      isInitialLoadRef.current = false;
    }
  }

  async function loadMessage() {
    try {
      const data = await getMessagesPaginated(0, PAGE_SIZE);
      if (!data) return;
      setMessage(data);
      setOffset(data.length);
      setHasMore(data.length === PAGE_SIZE);
      isInitialLoadRef.current = true;
    } catch (error) {
      console.error(error);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      loadMessage();
    }, [])
  )

  async function handleAddDepense(data: Message) {
    setIsTyping(true);
    try {
      if (!data) return setIsTyping(false);
      if (data.data.provision && data.data.provision.length > 0) {
        await setProvisions(data.data.provision);
      }
      if (!data?.data?.depense) return setIsTyping(false);
      const res = await setDepenses(data?.data?.depense);
      const json = JSON.parse(res);
      if (json.success) {

        await updateMessage({ id: data.id, type: "text", message: data.message, sender_type: "app", read: true, user_id: "1", created_at: data.created_at, updated_at: new Date().toISOString() }, data.id);

        const montants = (data?.data?.depense?.reduce((total: number, item: any) => total + item.montant, 0) || 0).toFixed(2);
        const date = formatDateStringForDisplay(data?.data?.depense[0].date as string);
        await sendMessage({
          id: Date.now().toString(), type: "text", message: `✅ C'est enregistré ! Votre dépense a bien été ajoutée.\nContinuez à suivre vos finances sereinement. 😊\n\n💰 Montant : ${montants} ${user?.devise || '€'}\n📆 Date : ${date}\n\nSuivi mis à jour avec succès. ✨`, sender_type: "app", read: true, user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), action: [{ value: 'Voir', label: "Voir" }, { value: "Copier", label: "Copier" }], reponse_id: data.data.depense[0].id
        });

        setIsTyping(false);
        setTimeout(() => {
          loadMessage();
        }, 1000);
        ToastAndroid.show(json.message, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleAction = (action: string, item: Message) => {
    switch (action) {
      case "Copier":
        copierTexte(item.message, "Message copié");
        setSelectedMessage(null);
        break;

      case "Modifier":
        setText(item.message);
        break;

      case "Supprimer":
        handleDelete(item.id);
        break;

      case "Valider":
        handleAddDepense(item);
        break;

      case "Voir":
        router.push({ pathname: `/detail-shopping`, params: { id: item.reponse_id } });
        break;

      case "Annuler":
        break;
    }
  };

  async function onSendText(text: string) {
    if (!text) return;

    let mess: Message | null = null;
    mess = selectedMessage?.id ?
      { id: selectedMessage.id, type: "text", message: text, sender_type: "user", read: true, user_id: "1", created_at: selectedMessage.created_at, updated_at: new Date().toISOString() }
      : { id: Date.now().toString(), type: "text", message: text, sender_type: "user", read: true, user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

    try {
      selectedMessage?.id ? await updateMessage(mess as Message, selectedMessage.id) : await sendMessage(mess as Message);
      await loadMessage();
      await responseMessage(mess?.id as string, text, "text");
      setText("");
      setSelectedMessage(null);
    } catch (error) {
      console.error(error);
    }
  }

  async function onSendImage(image: string) {
    if (!image) return;
    const mess: Message = { id: Date.now().toString(), type: "image", message: image, sender_type: "user", read: true, user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    try {
      await sendMessage(mess);
      await loadMessage();
      await responseMessage(mess.id, image, "image");
    } catch (error) {
      console.error(error);
    }
  }

  async function onSendAudio(audio: string) {
    if (!audio) return;
    const mess: Message = { id: Date.now().toString(), type: "audio", message: audio, sender_type: "user", read: true, user_id: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    try {
      await sendMessage(mess);
      await loadMessage();
      await responseMessage(mess.id, audio, "audio");
    } catch (error) {
      console.error(error);
    }
  }

  async function responseMessage(id: string, m: string, type: string) {
    setIsTyping(true);
    if (type === "audio") {
      const text = await transcribeText(m);
      if (text) {
        const textAnalyser = await analyseText(text as string);
        const { texteClair, json } = extraireTexteEtJson(textAnalyser);
        console.log(texteClair);

        const mess: Message = {
          id: Date.now().toString(), type: "text", message: texteClair, sender_type: "app", read: true, user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), reponse_id: id, data: json, action: json ? [{ value: "Valider", label: "Valider" }, { value: "Modifier", label: "Modifier" }, { value: "Supprimer", label: "Supprimer" }] : []
        };
        setIsTyping(false);
        await sendMessage(mess);
        await loadMessage();
      }
    }
    if (type === "text") {
      const textAnalyser = isOnline ? await analyseText(m as string) : await scanText(m as string, "user");
      let texteClair: string = "";
      let json = { depense: [], provision: [] };
      if (!isOnline) {
        texteClair = textAnalyser.textClair;
        json = { depense: textAnalyser.depense, provision: textAnalyser.provision };
      }
      else {
        const res = extraireTexteEtJson(textAnalyser);
        texteClair = res.texteClair;
        json = { depense: res?.json?.depense as [], provision: res?.json?.provision as [] };
      }

      const messResponse: Message | undefined = selectedMessage?.id ? message.find((msg) => msg.reponse_id === selectedMessage?.id) : undefined;
      const hasDepenses = Array.isArray(json?.depense) && json!.depense.length > 0;
      const mess: Message = {
        id: messResponse?.id ? messResponse.id : Date.now().toString(),
        type: "text",
        message: texteClair,
        sender_type: "app",
        read: true,
        user_id: "1",
        created_at: messResponse?.created_at ? messResponse.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reponse_id: id,
        data: hasDepenses ? json : {},
        action: hasDepenses ? [{ value: "Valider", label: "Valider" }, { value: "Modifier", label: "Modifier" }, { value: "Supprimer", label: "Supprimer" }, { value: "Copier", label: "Copier" }] : []
      };
      messResponse?.id ? await updateMessage(mess, messResponse.id) : await sendMessage(mess);
      setIsTyping(false);
      setSelectedMessage(null);
      await loadMessage();
    }
    if (type === "image") {
      let mess: Message | undefined = undefined;
      try {
        const result = isOnline ? await sendDataToScan(m) : await scanReceiptOffline(m);
        if (!result) { setIsTyping(false); return; }
        if (result.textClair && result.depense.length > 0) {
          const json = { depense: result.depense, provision: result.provision };
          mess = {
            id: Date.now().toString(), type: "text", message: result.textClair, sender_type: "app", read: true, user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), reponse_id: id, data: json, action: [{ value: "Valider", label: "Valider" }, { value: "Modifier", label: "Modifier" }, { value: "Supprimer", label: "Supprimer" }, { value: "Copier", label: "Copier" }]
          };
        } else if (result.textClair && result.depense.length <= 0) {
          mess = {
            id: Date.now().toString(), type: "text", message: result.textClair, sender_type: "app", read: true, user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), reponse_id: id
          };
        }
      } catch (error) {
        console.log(error);
        setIsTyping(false);
        return;
      }
      setIsTyping(false);
      if (mess) {
        await sendMessage(mess);
        await loadMessage();
      }
    }
  }

  function renderMessage(item: Message) {
    if (item.type === "text") {
      return <Text style={{ color: item.sender_type === "app" ? textColor : '#fff', fontSize: 16 }}>{item.message}</Text>;
    } else if (item.type === "image") {
      return <Image source={{ uri: item.message }} style={{ width: 200, height: 200 }} />;
    } else if (item.type === "audio") {
      return <LecteurAudioMessage uri={item.message} />;
    }
  }

  async function handleDelete(id: string) {
    const res = await removeMessage(id || "");
    const data = JSON.parse(res);
    if (data.success) {
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
      await loadMessage();
      setSelectedMessage(null);
      setShowModal(false);
    }
  }

  function handleLongPress(item: Message) {
    setSelectedMessage(item);
    setShowModal(true);
  }

  async function handleCopy() {
    await copierTexte(selectedMessage?.message || "", "Message copié");
    setShowModal(false);
    setSelectedMessage(null);
  }

  function handleEdit() {
    setText(selectedMessage?.message || "");
    setShowModal(false)
  }

  function onClearResponse() {
    setTextToResponse(null);
    setShowModal(false);
    setSelectedMessage(null);
  }

  const handleResponse = () => {
    setTextToResponse(selectedMessage);
    setShowModal(false);
  }

  function getActionIcon(value: Action["value"]) {
    const size = 15;
    switch (value) {
      case "Valider": return <Check size={size} color={`${successColor}`} />;
      case "Modifier": return <Edit size={size} color={"#0082fc"} />;
      case "Supprimer": return <Trash2Icon size={size} color={`${dangerColor}`} />;
      case "Copier": return <Copy size={size} color={`${sectionColor}`} />;
      case "Annuler": return <X size={size} color={`${dangerColor}`} />;
      case "Voir": return <Eye size={size} color={`${sectionColor}`} />;
      default: return null;
    }
  }

  const handleDeleteAll = async () => {
    await removeAllMessageByUId();
    await loadMessage();
    setShowModal(false);
    setGlobalSelect(false);
    setSelectedMessage(null);
  }

  return (
    <MainHeader
      scrollRef={scrollViewRef}
      onScroll={handleScroll}
      onContentSizeChange={handleContentSizeChange}
      height={100}
      fabScroll={
        <FloatingActionButton
          opacity={opacity}
          translateY={translateY}
          onPress={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          icon={<ChevronDown size={20} color="#fff" />}
          position={{ left: 0, right: 0, width: 40, height: 40, bottom: 24 }}
        />
      }
      header={() => <HeaderWithSearch searchable={false} title="Type Messenger" />}
      footer={() => <FooterTypeMessenger setSound={onSendAudio} setText={onSendText} setImage={onSendImage} text={text} textToResponse={textToResponse} onClearResponse={onClearResponse} />}
    >
      {loadingMore && (
        <View style={{ alignItems: "center", paddingVertical: 12 }}>
          <ThreeDotsLoader width={6} height={6} color={textColor} />
        </View>
      )}

      <RenderImage value={image} onChange={() => { setShowImage(false); setImage("") }} visible={showImage} />

      <Pressable
        onLongPress={() => { setShowModal(true); setGlobalSelect(true); }}
        style={{ flex: 1, zIndex: -1 }}
      >
        {message.length === 0 && <EmptyData message="Vous n'avez aucun message" icon={<MessageCircleOffIcon color={labelColor} size={50} />} />}

        {message.length > 0 &&
          <View style={{ flex: 1 }}>
            {message.map((item, index) => {
              const isApp = item.sender_type === "app";
              const nextItem = message[index + 1];
              const isLastOfAppGroup =
                isApp &&
                (!nextItem || nextItem.sender_type !== "app");
              return (
                <View key={index} style={{ flexDirection: "column", alignItems: !isApp ? "flex-end" : "flex-start", marginBottom: 5, width: "100%" }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-end", maxWidth: "80%", gap: 2, }}>
                    {isApp && (
                      isLastOfAppGroup
                        ? <Image source={require("@/assets/images/logo.png")} style={{ width: 30, height: 30 }} />
                        : <View style={{ width: 30, height: 30 }} />
                    )}
                    <Pressable
                      onLongPress={(e) => {
                        e.stopPropagation();
                        setGlobalSelect(false);
                        handleLongPress(item);
                      }}
                      onPress={() =>
                        item.type === "image" &&
                        (setImage(item.message), setShowImage(true))
                      }
                      style={{
                        height: "auto",
                        borderRadius: 15,
                        backgroundColor: item === selectedMessage ? `${sectionColor}4d` : !isApp ? sectionColor : backgroundColor,
                        borderBottomLeftRadius: isApp ? isLastOfAppGroup ? 0 : 15 : 15,
                        borderBottomRightRadius: isApp ? 15 : 0,
                        padding: item.type === "image" ? 0 : 10,
                        overflow: "hidden",
                        borderWidth: item.type === "image" ? 1 : 0,
                        borderColor: item === selectedMessage ? `${sectionColor}4d` : sectionColor,
                        position: "relative",
                      }}
                    >
                      {renderMessage(item)}
                    </Pressable>
                  </View>
                  {item.action && (
                    <View style={{ flexDirection: "row", gap: 6, marginTop: 5, marginLeft: 30, maxWidth: "80%" }}>
                      {item?.action?.map(action => (
                        <TouchableOpacity
                          key={action.value}
                          onPress={() => handleAction(action.value, item)}
                          style={[
                            styles.miniButton,
                            {
                              backgroundColor:
                                action.value === "Supprimer" ? `${dangerColor}2d` :
                                  action.value === "Valider" ? `${successColor}2d` :
                                    action.value === "Modifier" ? "#0082fc2d" :
                                      `${sectionColor}2d`,
                              height: 'auto',
                              paddingVertical: 10,
                              borderRadius: 10,
                            },
                          ]}
                        >
                          {getActionIcon(action.value)}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )
            })}

            {isTyping && (
              <View style={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row", gap: 10, width: "100%" }}>
                <Text style={{ backgroundColor, borderRadius: 20, padding: 10, width: "auto" }}>
                  <ThreeDotsLoader width={6} height={6} color={textColor} />
                </Text>
              </View>
            )}
          </View>}
      </Pressable>

      <MenuModal onChange={() => { setShowModal(false); setSelectedMessage(null); }} visible={showModal} >
        {!globalSelect ?
          <View style={[{ gap: 10, paddingTop: 10 }]}>
            <Pressable onPress={handleCopy} style={[styles.itemModal]}>
              <Copy size={24} color={textColor} />
              <Text style={[styles.itemText, { color: textColor, fontSize: 16, fontWeight: "400" }]}>Copier</Text>
            </Pressable>
            <Pressable onPress={handleResponse} style={[styles.itemModal]}>
              <MessageCircleIcon size={24} color={textColor} />
              <Text style={[styles.itemText, { color: textColor, fontSize: 16, fontWeight: "400" }]}>Répondre</Text>
            </Pressable>
            {selectedMessage?.sender_type === "user" && selectedMessage?.type === "text" && <Pressable onPress={handleEdit} style={[styles.itemModal]}>
              <Edit size={24} color={textColor} />
              <Text style={[styles.itemText, { color: textColor, fontSize: 16, fontWeight: "400" }]}>Modifier</Text>
            </Pressable>}
            <Pressable onPress={() => handleDelete(selectedMessage?.id as string)} style={[styles.itemModal]}>
              <Trash2Icon size={24} color={dangerColor} />
              <Text style={[styles.itemText, { color: dangerColor, fontSize: 16, fontWeight: "400" }]}>Supprimer</Text>
            </Pressable>
          </View> :
          <View style={[{ gap: 10, paddingTop: 10 }]}>
            <Pressable onPress={handleDeleteAll} style={[styles.itemModal]}>
              <Trash2Icon size={24} color={dangerColor} />
              <Text style={[styles.itemText, { color: dangerColor, fontSize: 16, fontWeight: "400" }]}>Supprimer la conversation</Text>
            </Pressable>
          </View>
        }

      </MenuModal>

    </MainHeader >
  )
}