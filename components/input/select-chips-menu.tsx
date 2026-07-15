import { View, Text, Pressable } from 'react-native'
import React, { createContext } from 'react'
import { SelectProps } from '@/types/global'
import { styles } from '@/styles/styles'
import { useAppColors } from '@/hooks/useAppColors';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import SelectChips from './select-chips';
import MenuModal from '../modal/menu-modal';


const MenuContext = createContext<{ close: () => void } | null>(null)

export default function SelectChipsMenu({ data, value, setValue, label, style, position }: SelectProps) {
  const { textColor, inputBg, backgroundColor, border, labelColor } = useAppColors();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const close = () => setMenuOpen(false)

  function selectText(v: string) {
    setValue(v);
    close();
  }

  function getLabel(): string {
    const item = data?.find(
      (item) =>
        (typeof item === "string"
          ? item
          : item.value) === value
    );

    return item
      ? typeof item === "string"
        ? item
        : item.label
      : "";
  }

  return (
    <View style={style}>
      <View style={[styles.field]}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <Pressable onPress={() => setMenuOpen((v) => !v)} style={[
          styles.input, styles.itemsHeader, { backgroundColor: inputBg, borderColor: border, marginBottom: 0, paddingVertical: 12 }]}>
          <Text style={{ color: textColor, fontSize: 16 }}>{getLabel()}</Text>
          {!menuOpen ? <ChevronDown color={textColor} size={15} /> : <ChevronUp color={textColor} size={15} />}
        </Pressable>
      </View>

      <MenuModal visible={menuOpen} onChange={close}>
        <Text style={[styles.label, { color: textColor, fontSize: 16, margin: 10, textAlign: "center" }]}>Choisir {label ? label : "une option"}</Text>
        <View style={[styles.card, styles.infoGridFull, { padding: 10, borderRadius: 10, backgroundColor: inputBg, marginVertical: 10, borderColor: border }]}>
          <MenuContext.Provider value={{ close }}>
            <>
              {data && <SelectChips data={data} value={value} setValue={selectText} />}
            </>
          </MenuContext.Provider>
        </View>
      </MenuModal>
    </View>
  )
}