import { View, Text, Pressable } from 'react-native'
import React, { createContext } from 'react'
import { useAppColors } from '@/hooks/useAppColors';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { styles } from '@/styles/styles';
import { SelectProps } from '@/types/global';


const MenuContext = createContext<{ close: () => void } | null>(null)

export default function SelectInput({ value, setValue, data, label, style, position }: SelectProps) {
  const { textColor, inputBg, sectionColor, border, labelColor } = useAppColors();
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
          styles.input, styles.itemsHeader, { backgroundColor: inputBg, borderColor: border, marginBottom: 0 }]}>
          <Text style={{ color: textColor }}>{getLabel()}</Text>
          {!menuOpen ? <ChevronDown color={textColor} size={15} /> : <ChevronUp color={textColor} size={15} />}
        </Pressable>
      </View>

      {menuOpen && (
        <>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
            onPress={close}
          />
          <View
            style={{
              position: 'absolute',
              top: position?.top,
              right: position?.right,
              left: position?.left,
              bottom: position?.bottom,
              backgroundColor: inputBg,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: border,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
              minWidth: 160,
              width: position?.width,
              zIndex: 1,
            }}
          >
            <MenuContext.Provider value={{ close }}>
              <>
                {data && data?.map((v, i) => {

                  const val = typeof v === "string" ? v : v.value;
                  const lab = typeof v === "string" ? v : v.label;

                  return (
                    <View key={i}>
                      <Pressable style={[{ padding: 8, backgroundColor: val === value ? sectionColor : "" }]} onPress={() => selectText(val)}>
                        <Text style={{ color: val === value ? "#fff" : textColor, fontWeight: val === value ? "bold" : "normal" }}>{lab}</Text>
                      </Pressable>
                      {i !== (data.length - 1) && <View style={{ height: 1, backgroundColor: border, opacity: 0.2 }} />}
                    </View>
                  )
                })}
              </>
            </MenuContext.Provider>
          </View>
        </>
      )}
    </View>
  )
}