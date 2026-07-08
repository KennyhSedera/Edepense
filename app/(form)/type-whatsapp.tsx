import { View, Text, Image } from 'react-native'
import React from 'react'
import { MainHeader } from '@/components/header/header-main'
import { HeaderWithSearch } from '../(guest)/_layout'
import FooterTypeMessenger from '@/components/footer/footer-type-messenger'
import { useAppColors } from '@/hooks/useAppColors'
import { Message } from '@/types/db'
import useVoiceRecord from '@/hooks/useVoiceRecord'
import { LecteurAudioMessage } from '@/components/audio/LecteurAudioMessage'
import { getMessages, removeMessage, sendMessage } from '@/controller/message.controller'
import { useFocusEffect } from 'expo-router'
import EmptyData from '@/components/ui/empty-data'
import { MessageCircleOffIcon } from 'lucide-react-native'
import { Pressable } from 'react-native';

export default function TypeWhatsapp() {
  const { textColor, backgroundColor, dangerColor, labelColor, sectionColor } = useAppColors();
  const [message, setMessage] = React.useState<Message[]>([]);

  const { transcribeText } = useVoiceRecord();

  async function loadMessage() {
    try {
      const data = await getMessages();

      if (!data) return;
      setMessage(data);
    } catch (error) {
      console.error(error);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      loadMessage();
    }, [])
  )

  async function onSendText(text: string) {
    const mess: Message = { id: Date.now().toString(), type: "text", message: text, sender_type: "user", read: true, user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    try {
      await sendMessage(mess);
      loadMessage();
    } catch (error) {
      console.error(error);
    }
  }

  async function onSendImage(image: string) {
    if (!image) return;
    const mess: Message = { id: Date.now().toString(), type: "image", message: image, sender_type: "user", read: true, user_id: "1", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    try {
      await sendMessage(mess);
      loadMessage();
    } catch (error) {
      console.error(error);
    }
  }

  async function onSendAudio(audio: string) {
    if (!audio) return;
    const mess: Message = { id: Date.now().toString(), type: "audio", message: audio, sender_type: "user", read: true, user_id: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    try {
      await sendMessage(mess);
      loadMessage();
    } catch (error) {
      console.error(error);
    }
  }

  function renderMessage(item: Message) {
    if (item.type === "text") {
      return <Text style={{ color: textColor, fontSize: 16 }}>{item.message}</Text>;
    } else if (item.type === "image") {
      return <Image source={{ uri: item.message }} style={{ width: 200, height: 200 }} />;
    } else if (item.type === "audio") {
      return <LecteurAudioMessage uri={item.message} />;
    }
  }

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Type Messenger" />}
      footer={() => <FooterTypeMessenger setSound={onSendAudio} setText={onSendText} setImage={onSendImage} />}
    >
      {message.length === 0 && <EmptyData message="Vous n'avez aucun message" icon={<MessageCircleOffIcon color={labelColor} size={50} />} />}
      {message.length > 0 && <View style={{ flex: 1 }}>
        {message.map((item, index) => {
          return (
            <View key={index} style={{ flexDirection: "column", alignItems: item.sender_type === "user" ? "flex-end" : "flex-start", marginBottom: 5, width: "100%" }}>
              <View style={{ maxWidth: "80%", height: "auto", backgroundColor: item.sender_type === "user" ? sectionColor : backgroundColor, borderRadius: 10, borderBottomLeftRadius: item.sender_type !== "user" ? 0 : 10, borderBottomRightRadius: item.sender_type !== "user" ? 10 : 0, padding: item.type === "image" ? 0 : 10, overflow: "hidden", borderWidth: item.type === "image" ? 1 : 0, borderColor: sectionColor, position: "relative" }}>
                {renderMessage(item)}
                <View style={{ position: "absolute", top: 5, right: 5 }}>
                  <Pressable onPress={() => { removeMessage(item.id); loadMessage() }}>
                    <Text style={{ color: dangerColor }}>Supprimer</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )
        })}
      </View>}
    </MainHeader >
  )
}