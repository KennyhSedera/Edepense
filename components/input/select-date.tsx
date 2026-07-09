import { View, Text, Pressable } from 'react-native'
import React, { createContext } from 'react'
import { useAppColors } from '@/hooks/useAppColors'
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { ITEMS_DATE } from '@/constants/type';
import { Position } from '@/types/global';


const MenuContext = createContext<{ close: () => void } | null>(null)

export default function SelectDate({ value, setValue, position }: { value: string, setValue: (v: string) => void, position?: Position }) {
  const { textColor, inputBg, sectionColor, border } = useAppColors();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const close = () => setMenuOpen(false)

  function selectText(v: string) {
    setValue(v);
    close();
  }

  function getLabel(v: string): string {
    const text = ITEMS_DATE.find((l) => l.value === value)?.label
    return text as string | "";
  }

  return (
    <>
      <View>
        <Pressable onPress={() => setMenuOpen((v) => !v)} style={{ padding: 8, backgroundColor: inputBg, borderRadius: 10, alignItems: "center", flexDirection: 'row', gap: 4, width: "auto", justifyContent: "space-between" }}>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16 }}>{getLabel(value)}</Text>
          {!menuOpen ? <ChevronDown color={textColor} /> : <ChevronUp color={textColor} />}
        </Pressable>
      </View>

      {menuOpen && (
        <>
          <Pressable
            style={{ position: 'absolute', top: 10, left: 0, right: 0, bottom: 0, zIndex: 1 }}
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
              width: position?.width,
              zIndex: 1,
            }}
          >
            <MenuContext.Provider value={{ close }}>
              <>
                {ITEMS_DATE.map((v, i) => (
                  <View key={i}>
                    <Pressable style={[{ padding: 8, backgroundColor: v.value === value ? sectionColor : "" }]} onPress={() => selectText(v.value)}>
                      <Text style={{ color: v.value === value ? "#fff" : textColor, fontWeight: v.value === value ? "bold" : "normal" }}>{v.label}</Text>
                    </Pressable>
                    {i !== (ITEMS_DATE.length - 1) && <View style={{ height: 1, backgroundColor: border, opacity: 0.2 }} />}
                  </View>
                ))}
              </>
            </MenuContext.Provider>
          </View>
        </>
      )}
    </>
  )
}