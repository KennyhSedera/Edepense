import { Text, Pressable, View } from 'react-native'
import React, { } from 'react'
import { styles } from '@/styles/styles'
import { useAppColors } from '@/hooks/useAppColors'
import { CardMenuProps } from '@/types/global'

export default function CardMenu({ Icon, title, color = "#8f8f8f", iconColor = "#000", onPress }: CardMenuProps) {
  const { cardBg, textColor, border } = useAppColors();
  return (
    <Pressable onPress={onPress} style={[styles.card, styles.infoGridHalf, { backgroundColor: cardBg, paddingHorizontal: 8, paddingVertical: 12, borderRadius: 10, borderColor: border, gap: 6, marginVertical: 2 }]}>
      <View style={[styles.centered, { width: 35, height: 35, backgroundColor: color, borderRadius: 10, marginLeft: 4 }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <Text style={[styles.text, { color: textColor, marginLeft: 5, fontSize: 16 }]}>{title}</Text>
    </Pressable>
  )
}