import { View, Text, Modal, Pressable } from 'react-native'
import React from 'react'
import { DeleteModalProps } from '@/types/global'
import { styles } from '@/styles/styles'
import { useAppColors } from '@/hooks/useAppColors';
import { BlurView } from 'expo-blur';

export default function DeleteModal({ id, message, visible, onChange }: DeleteModalProps) {
  const { textColor, backgroundColor, border, cardBg, labelColor, isDark, dangerColor } = useAppColors();
  return (
    <View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => onChange("close", "")}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => onChange("close", "")}
        >
          <BlurView
            intensity={50}
            tint={isDark ? 'dark' : 'light'}
            style={styles.blur}
          >
            <View style={[styles.modal, { backgroundColor, borderColor: border }]}>
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
                </Pressable></View>
            </View>
          </BlurView>
        </Pressable>
      </Modal>
    </View>
  )
}