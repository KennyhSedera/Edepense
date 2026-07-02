import { Modal, Pressable, Text, View } from 'react-native'
import React from 'react'
import { ModalProps } from '@/types/global'
import { pickFromGallery, takePhoto } from '@/utils/image.util';
import { useAppColors } from '@/hooks/useAppColors';
import { CameraIcon, Image } from 'lucide-react-native';
import { styles } from '@/styles/styles';
import { BlurView } from 'expo-blur';


export default function ImagePikerModal({
  value,
  onChange,
  visible,
}: ModalProps) {
  const { textColor, backgroundColor, border, isDark, inputBg, labelColor, sectionColor } = useAppColors();

  return (
    <View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => onChange(value || "")}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => onChange(value || "")}
        >
          <BlurView
            intensity={50}
            tint={isDark ? 'dark' : 'light'}
            style={styles.blur}
          >
            <View style={[styles.modal, { backgroundColor, borderColor: isDark ? border : textColor }]}>
              <Text style={[styles.title, { color: textColor, textAlign: "center", marginBottom: 20 }]}>Ajouter une image</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                <Pressable onPress={() => takePhoto(onChange)} style={[styles.card, { backgroundColor: inputBg, borderColor: border, alignItems: "center", paddingVertical: 15 }]}>
                  <CameraIcon size={50} color={labelColor} />
                  <Text style={{ color: labelColor, marginTop: 5 }}>Ouvrir la caméra</Text>
                </Pressable>
                <Pressable onPress={() => pickFromGallery(onChange)} style={[styles.card, { backgroundColor: inputBg, borderColor: border, alignItems: "center", paddingVertical: 15 }]}>
                  <Image size={50} color={labelColor} />
                  <Text style={{ color: labelColor, marginTop: 5 }}>Ouvrir la galerie</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => onChange("")} style={[styles.button, { backgroundColor: sectionColor, borderColor: backgroundColor }]}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Annuler</Text>
              </Pressable>
            </View>
          </BlurView>
        </Pressable>
      </Modal>
    </View >
  )
}
