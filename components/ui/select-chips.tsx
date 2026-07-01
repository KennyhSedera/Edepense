import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useAppColors } from '@/hooks/useAppColors'
import { styles } from '@/styles/styles';
import { SelectProps } from '@/types/global';

export default function SelectChips({ data, value, setValue, label }: SelectProps) {
  const { inputBg, border, labelColor, textColor, sectionColor } = useAppColors();
  return (
    <View style={[label && styles.field]}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <View style={[styles.chipsWrap]}>
        {data.map((c) => {
          const v = typeof c === "string" ? c : c.value;
          const label = typeof c === "string" ? c : c.label;

          return (
            <Pressable
              key={v}
              onPress={() => setValue(v)}
              style={[styles.chip, { backgroundColor: v === value ? sectionColor : inputBg, borderColor: border }]}
            >
              <Text style={[styles.chipText, { color: v === value ? "white" : textColor, }]}>{label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}