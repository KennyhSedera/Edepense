import { View, Text, Pressable } from 'react-native'
import React from 'react'
import MenuModal from './menu-modal'
import { styles } from '@/styles/styles'
import { useAppColors } from '@/hooks/useAppColors';

export default function ModalConfirm({ visible, onChange, message, title, buttonText }: any) {
  const { textColor, cardBg, white, info } = useAppColors();
  return (
    <MenuModal visible={visible} onChange={onChange} >
      <Text style={[styles.title, { color: info, textAlign: "center", marginBottom: 5 }]}>{title || "Confirmation"}</Text>
      <Text style={[styles.name, { color: textColor, textAlign: "center", marginVertical: 30 }]}>{message}</Text>
      <View style={[styles.infoGrid, { marginBottom: 0 }]}>
        <Pressable
          onPress={() => onChange("close", "")}
          style={[styles.miniButton, styles.infoGridHalf, { backgroundColor: `${cardBg}` }]}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>Annuler</Text>
        </Pressable>
        <Pressable
          onPress={() => onChange("confirm", "")}
          style={[styles.miniButton, styles.infoGridHalf, { backgroundColor: info }]}
        >
          <Text style={[styles.buttonText, { color: white }]}> {buttonText || "Confirmer"}</Text>
        </Pressable>
      </View>
    </MenuModal>
  )
}