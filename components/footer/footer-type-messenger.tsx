import { View, Text, Pressable, Image } from 'react-native'
import React, { useEffect } from 'react'
import { styles } from '@/styles/styles'
import { Camera, Mic, SendHorizonalIcon, Trash2Icon, XIcon, } from 'lucide-react-native'
import Field from '../input/InputText'
import { useAppColors } from '@/hooks/useAppColors'
import ImagePikerModal from '../modal/ImagePikerModal'
import useVoiceRecord from '@/hooks/useVoiceRecord'
import { supprimerAudio } from '@/utils/voice.util'
import BarAnimed from '../audio/BarAnimed'
import { useNavigation } from 'expo-router'
import { FooterMessageProps } from '@/types/global'
import { LecteurAudioMessage } from '../audio/LecteurAudioMessage'
import { useAppNet } from '@/hooks/useAppNet'

export default function FooterTypeMessenger({ setImage, setText, setSound, text, textToResponse, onClearResponse }: FooterMessageProps) {
  const { gradient: { to, from }, isDark, labelColor, dangerColor, border, sectionColor, textColor } = useAppColors();
  const { duree, barAnims, isRecording, isPaused, formatDuree, stopRecording, startRecording, setAudio } = useVoiceRecord(32);
  const [message, setMessage] = React.useState('');
  const [uriImage, setUriImage] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const navigation = useNavigation();
  const { isOnline } = useAppNet();

  useEffect(() => {
    setMessage(text as string);
  }, [text]);

  useEffect(() => {
    if (duree >= 60) {
      onStop();
    }
  }, [duree])

  function onChangeUri(params: string) {
    setUriImage(params);
    setImage && setImage(params);
    setVisible(false);
    setTimeout(() => {
      setUriImage("");
    }, 1000);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async (e) => {
      if (!isRecording) return;
      await stopAndDelete();
      navigation.dispatch(e.data.action);
    });

    return unsubscribe;
  }, [navigation]);

  function onChangeText(params: string) {
    setMessage(params);
  }

  function onSendText() {
    setText && setText(message);
    setMessage('');
  }

  async function onStop() {
    const uri = await stopRecording();
    if (uri) {
      setSound && setSound(uri);
    }
  }

  async function stopAndDelete() {
    const uri = await stopRecording();
    if (uri) {
      await supprimerAudio(uri);
      setSound && setSound("");
    }
    setAudio(null);
  }

  return (
    <View style={[{ width: "100%", position: "relative" }]}>
      {textToResponse &&
        <View style={[styles.rowSpacing, { marginBottom: 10, padding: 10, borderRadius: 20, backgroundColor: "#ffffff34", alignItems: "flex-start", gap: 10, borderWidth: 1, borderColor: "#ffffffb2", height: "auto" }]}>
          <View style={{ flexDirection: "column", alignItems: "flex-start", gap: 5, flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Réponse à :</Text>
            {textToResponse.type === "text" && <Text style={{ color: "#fff", }} numberOfLines={3}>{textToResponse.message}</Text>}
            {textToResponse.type === "audio" && <LecteurAudioMessage uri={textToResponse.message} />}
            {textToResponse.type === "image" && <Image source={{ uri: textToResponse.message }} style={{ width: 50, height: 50, borderRadius: 10 }} />}
          </View>
          <Pressable onPress={onClearResponse} style={{ padding: 5, borderRadius: 20, backgroundColor: "#ffffff34" }}>
            <XIcon color={dangerColor} size={16} />
          </Pressable>
        </View>
      }
      <View style={[{ paddingHorizontal: 0 }]}>
        <ImagePikerModal value={uriImage} onChange={onChangeUri} visible={visible} />
        {!isRecording &&
          <View style={[styles.rowSpacing, { alignItems: "flex-end", width: "100%", gap: 8, }]}>
            <Pressable onPress={() => setVisible(true)} style={{ padding: 12, backgroundColor: to, borderRadius: 10 }}>
              <Camera size={20} color={"#fff"} />
            </Pressable>
            <Field
              style={{ flex: 1, marginBottom: 0 }}
              inputStyle={{ minHeight: 8, maxHeight: 200, padding: 0, color: textColor, backgroundColor: isDark ? "#000" : "#fff" }}
              value={message}
              onChangeText={onChangeText}
              placeholder="Envoyer un message"
              multiline
            />
            {!message && isOnline ?
              <Pressable onPress={() => { startRecording(); setSound && setSound(""); }} style={{ padding: 12, backgroundColor: from, borderRadius: 10 }}>
                <Mic size={20} color={"#fff"} />
              </Pressable> :
              <Pressable onPress={message ? onSendText : () => { }} style={{ padding: 12, backgroundColor: from, borderRadius: 10 }}>
                <SendHorizonalIcon size={20} color={message ? "#fff" : "#919191"} />
              </Pressable>}
          </View>}

        {isRecording &&
          <View style={[styles.rowSpacing, { gap: 10, width: "100%" }]}>
            <Pressable onPress={stopAndDelete} style={{ padding: 12, backgroundColor: dangerColor, borderRadius: 10 }}>
              <Trash2Icon size={20} color={"#fff"} />
            </Pressable>
            <View style={[styles.rowSpacing, { gap: 10, flex: 1, backgroundColor: isDark ? "#000" : "#fff", paddingHorizontal: 12, borderRadius: 10, paddingVertical: 8, borderColor: border, borderWidth: 1 }]}>
              <BarAnimed barAnims={barAnims} isRecording={isRecording} isPaused={isPaused} sectionColor={sectionColor} border={border} />
              <Text
                style={{
                  fontSize: 12,
                  color: isRecording && !isPaused ? dangerColor : labelColor,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatDuree(duree)}
              </Text>
            </View>
            <Pressable onPress={onStop} style={{ padding: 12, backgroundColor: sectionColor, borderRadius: 10 }}>
              <SendHorizonalIcon size={20} color={"#fff"} />
            </Pressable>
          </View>}
      </View>
    </View>
  )
}