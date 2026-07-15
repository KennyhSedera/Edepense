import { View, Text, Modal, Pressable } from 'react-native'
import React from 'react'
import { styles } from '@/styles/styles'
import { ModalProps } from '@/types/global'
import { useAppColors } from '@/hooks/useAppColors';

export default function MenuModal({
  onChange,
  children,
  visible,
}: ModalProps) {
  const { textColor, backgroundColor, border, isDark, dangerColor, labelColor, sectionColor } = useAppColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onChange}
    >
      <Pressable
        style={[styles.overlay, { justifyContent: "flex-end" }]}
        onPress={onChange}
      >
        <View style={[styles.modal, { backgroundColor, borderColor: isDark ? border : textColor, paddingBottom: 10 }]}>
          <View style={{ flexDirection: "row", justifyContent: "center", width: "100%", marginBottom: 10 }}><View style={{ height: 6, width: '20%', backgroundColor: `${textColor}50`, borderRadius: 10 }} />
          </View>
          {children}
        </View>
      </Pressable>
    </Modal>

  )
}