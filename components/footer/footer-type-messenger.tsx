import { View, Text, Pressable, } from 'react-native'
import React, { useEffect } from 'react'
import { styles } from '@/styles/styles'
import { Camera, Mic, SendHorizonalIcon, Trash2Icon, } from 'lucide-react-native'
import Field from '../input/InputText'
import { useAppColors } from '@/hooks/useAppColors'
import ImagePikerModal from '../modal/ImagePikerModal'
import useVoiceRecord from '@/hooks/useVoiceRecord'
import { supprimerAudio } from '@/utils/voice.util'
import BarAnimed from '../audio/BarAnimed'
import { useNavigation } from 'expo-router'

export default function FooterTypeMessenger({ setImage, setText, setSound, text }: { setImage?: (uri: string) => void, setText?: (text: string) => void, setSound?: (uri: string) => void, text?: string }) {
  const { gradient: { to, from }, isDark, labelColor, dangerColor, border, sectionColor, textColor } = useAppColors();
  const { duree, barAnims, isRecording, isPaused, audio, formatDuree, stopRecording, startRecording, setAudio } = useVoiceRecord(32);
  const [message, setMessage] = React.useState('');
  const [uriImage, setUriImage] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    setMessage(text as string);
  }, [text]);

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
    <View>
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
          {!message ?
            <Pressable onPress={() => { startRecording(); setSound && setSound(""); }} style={{ padding: 12, backgroundColor: from, borderRadius: 10 }}>
              <Mic size={20} color={"#fff"} />
            </Pressable> :
            <Pressable onPress={onSendText} style={{ padding: 12, backgroundColor: from, borderRadius: 10 }}>
              <SendHorizonalIcon size={20} color={"#fff"} />
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
  )
}