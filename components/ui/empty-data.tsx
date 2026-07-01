import { View, Text } from 'react-native'
import React from 'react'
import { EmptyDataProps } from '@/types/global'
import { styles } from '@/styles/styles'
import { useAppColors } from '@/hooks/useAppColors';

export default function EmptyData(props: EmptyDataProps) {
  const { cardBg, border, textColor, labelColor } = useAppColors();

  return (
    <View style={[styles.empty, { backgroundColor: cardBg, borderColor: border }]}>
      {props.icon}
      <Text style={[styles.emptyText, { color: labelColor }]}>{
        props.message}
      </Text>
    </View>
  )
}