import { View, Text, Pressable } from 'react-native'
import React, { createContext } from 'react'
import { SelectProps } from '@/types/global'
import { styles } from '@/styles/styles'
import { useAppColors } from '@/hooks/useAppColors';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import SelectChips from './select-chips';


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
      <View>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <Pressable onPress={() => setMenuOpen((v) => !v)} style={[
          styles.input, styles.itemsHeader, { backgroundColor: inputBg, borderColor: border, marginBottom: 0, paddingVertical: 12 }]}>
          <Text style={{ color: textColor, fontSize: 16 }}>{getLabel()}</Text>
          {!menuOpen ? <ChevronDown color={textColor} size={15} /> : <ChevronUp color={textColor} size={15} />}
        </Pressable>
      </View>
      {menuOpen && (
        <>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, flex: 1 }}
            onPress={close}
          />
          <View
            style={{
              position: 'absolute',
              top: position?.top,
              right: position?.right,
              left: position?.left,
              bottom: position?.bottom,
              width: position?.width,
              backgroundColor,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: border,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
              zIndex: 1,
              padding: 10
            }}
          >
            <MenuContext.Provider value={{ close }}>
              <>
                {data && <SelectChips data={data} value={value} setValue={selectText} />}
              </>
            </MenuContext.Provider>
          </View>
        </>
      )}
    </View>
  )
}