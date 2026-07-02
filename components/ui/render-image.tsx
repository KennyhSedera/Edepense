import { View, Text, Modal, Pressable, Image } from 'react-native'
import React from 'react'
import { ModalProps } from '@/types/global'
import { styles } from '@/styles/styles'
import { BlurView } from 'expo-blur'
import { useAppColors } from '@/hooks/useAppColors'
import { LucideXCircle } from 'lucide-react-native'
import { DIMENSION } from '@/constants/type'

export default function RenderImage({ value, onChange, visible }: ModalProps) {
  const { isDark } = useAppColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => onChange(false)}
    >
      <BlurView
        intensity={50}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.blur]}
      >
        <View style={[styles.infoGridFull, { backgroundColor: "#000000f1", padding: 0, height: DIMENSION.height, justifyContent: "center", position: 'relative' }]}>
          <Image source={value || { uri: value }} resizeMode='contain' style={[{
            width: "100%",
            height: "100%",
          }]} />
          <Pressable onPress={() => onChange(false)} style={[{ position: "absolute", top: 10, right: 10, zIndex: 1 }]}>
            <LucideXCircle size={30} color={"white"} />
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  )
}