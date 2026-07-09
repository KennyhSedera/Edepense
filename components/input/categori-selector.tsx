import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { styles } from '@/styles/styles';
import { CATEGORIES } from '@/constants/type';
import { useAppColors } from '@/hooks/useAppColors';

export default function CategoriSelector({ categorie, setCategorie }: { categorie: string, setCategorie: (v: string) => void }) {
  const { textColor, sectionColor, border, inputBg, labelColor } = useAppColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: labelColor }]}>Catégorie *</Text>
      <View style={styles.chipsWrap}>
        {CATEGORIES.map((cat) => {
          const selected = categorie === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategorie(cat)}
              style={[
                styles.chip,
                {
                  borderColor: selected ? sectionColor : border,
                  backgroundColor: selected ? sectionColor : inputBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? "#ffffff" : textColor },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  )
}