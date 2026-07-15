import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { DeleteModalProps } from '@/types/global'
import { styles } from '@/styles/styles'
import { useAppColors } from '@/hooks/useAppColors';
import MenuModal from './menu-modal';

export default function DeleteModal({ id, message, visible, onChange }: DeleteModalProps) {
  const { textColor, border, cardBg, labelColor, dangerColor } = useAppColors();
  return (
    <MenuModal visible={visible} onChange={() => onChange("close", "")} >
      <Text style={[styles.title, { color: dangerColor, textAlign: "center", marginBottom: 20 }]}>Supprimer ?</Text>

      <Text style={[styles.name, { color: textColor, textAlign: "center", marginBottom: 20 }]}>{message}</Text>

      <View style={styles.infoGrid}>
        <Pressable
          onPress={() => onChange("close", "")}
          style={[styles.miniButton, styles.infoGridHalf, { backgroundColor: cardBg, borderColor: border, alignItems: "center" }]}
        >
          <Text style={{ color: labelColor }}>Annuler</Text>
        </Pressable>
        <Pressable onPress={() => onChange("delete", id as string)} style={[styles.miniButton, styles.infoGridHalf, { backgroundColor: dangerColor, borderColor: border, alignItems: "center" }]}>
          <Text style={{ color: "white" }}>Supprimer</Text>
        </Pressable>
      </View>
    </MenuModal>
  )
}