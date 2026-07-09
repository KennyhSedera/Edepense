import { View, Text, Pressable, TouchableOpacity, Image, TextInput } from 'react-native'
import React, { useCallback, useState } from 'react'
import { styles } from '@/styles/styles'
import ImagePikerModal from '@/components/modal/ImagePikerModal'
import { useAppColors } from '@/hooks/useAppColors'
import { Camera, Trash2, } from 'lucide-react-native'
import { useFocusEffect } from 'expo-router'
import RenderImage from '@/components/modal/render-image'

export default function InputImage({ value, setValue, label = "Image (optionnel)" }: { value: string | undefined | null, setValue: (v: string) => void, label?: string }) {
  const [show, setShow] = useState(false)
  const { inputBg, border, textColor, sectionColor, labelColor, cardBg, dangerColor } = useAppColors();
  const [url, setUrl] = useState(value);
  const [urlText, setUrlText] = useState("");
  const [showImage, setShowImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setUrl(value)
    }, [value],)
  )

  function onChange(params: string) {
    setShow(false);
    setUrl(params);
    setUrlText("");
    setValue(params);
  }

  function onCloseShowImage() {
    setShowImage(false);
  }

  return (
    <View style={{ width: '100%' }}>
      <ImagePikerModal visible={show} onChange={onChange} value={value} />
      <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border }]}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>

        {url && (
          <Pressable style={{ position: "relative" }} onPress={() => setShowImage(true)}>
            <Image source={{ uri: url }} style={[styles.previewImage, { borderColor: border }]} />
          </Pressable>
        )}

        <RenderImage value={url} onChange={onCloseShowImage} visible={showImage} />

        <View style={{ flexDirection: "row", alignItems: 'center', gap: 10, justifyContent: "center" }}>
          <TouchableOpacity
            style={[styles.button, {
              borderColor: border, backgroundColor: inputBg,
              width: url ? '48%' : '100%',
            }]}
            onPress={() => setShow(!show)}
          >
            <Camera color={labelColor} size={16} style={{ marginRight: 6 }} />
            <Text style={[styles.buttonText, { color: labelColor, fontWeight: url ? "bold" : "light" }]}>
              {url ? "Changer" : "Choisir une photo"}
            </Text>
          </TouchableOpacity>

          {url && <TouchableOpacity
            style={[styles.button, { borderColor: border, backgroundColor: dangerColor, width: '48%', paddingVertical: 8 }]}
            onPress={() => { setUrl(""); onChange("") }}
          >
            <Trash2 color={"white"} size={16} style={{ marginRight: 6 }} />
            <Text style={[styles.buttonText, { color: "white" }]}>
              Supprimer
            </Text>
          </TouchableOpacity>}
        </View>

        <Text style={[styles.orText, { color: labelColor }]}>ou coller une URL</Text>

        <View style={styles.urlRow}>
          <TextInput
            value={urlText}
            onChangeText={(e) => setUrlText(e)}
            placeholder="https://..."
            placeholderTextColor={labelColor}
            style={[
              styles.input,
              styles.urlInput,
              { color: textColor, borderColor: border, backgroundColor: inputBg },
            ]}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.smallButton, { borderColor: border, backgroundColor: inputBg }]}
            onPress={() => { setUrl(urlText), setValue(urlText) }}
          >
            <Text style={[styles.buttonText, { color: sectionColor }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}