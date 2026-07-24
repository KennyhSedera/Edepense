import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { useAppColors } from '@/hooks/useAppColors'
import { styles } from '@/styles/styles';
import { SelectChipsMultiProps } from '@/types/global';

export default function SelectChipsMulti({ data, values, setValues, label, groupes }: SelectChipsMultiProps) {
  const { inputBg, border, labelColor, textColor, sectionColor } = useAppColors();

  const toggleValue = (v: string) => {
    setValues(
      values.includes(v) ? values.filter((val) => val !== v) : [...values, v]
    );
  };

  const appliquerGroupe = (nomGroupe: string) => {
    setValues(groupes?.[nomGroupe] ?? []);
  };

  return (
    <View style={[label && styles.field]}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}

      {groupes && Object.keys(groupes).length > 0 && (
        <View style={[styles.chipsWrap, { marginBottom: 12 }]}>
          {Object.keys(groupes).map((nomGroupe) => (
            <Pressable
              key={nomGroupe}
              onPress={() => appliquerGroupe(nomGroupe)}
              style={[styles.chip, { backgroundColor: inputBg, borderColor: border }]}
            >
              <Text style={[styles.chipText, { color: sectionColor }]}>+ {nomGroupe}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={[styles.chipsWrap]}>
        {data.map((c) => {
          const v = typeof c === "string" ? c : c.value;
          const chipLabel = typeof c === "string" ? c : c.label;
          const selectionne = values.includes(v);

          return (
            <Pressable
              key={v}
              onPress={() => toggleValue(v)}
              style={[styles.chip, { backgroundColor: selectionne ? sectionColor : inputBg, borderColor: border }]}
            >
              <Text style={[styles.chipText, { color: selectionne ? "white" : textColor }]}>{chipLabel}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}