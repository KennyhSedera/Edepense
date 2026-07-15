import { View, Text, Pressable, ViewStyle } from 'react-native'
import React, { createContext, useContext } from 'react'
import { MoreVertical } from 'lucide-react-native'
import { useAppColors } from '@/hooks/useAppColors'
import { Position } from '@/types/global'

const MenuContext = createContext<{ close: () => void } | null>(null)

export default function MenuButton({ children, position, style, iconSize }: { children: React.ReactNode, position?: Position, style?: ViewStyle, iconSize?: number }) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { backgroundColor, textColor, cardBg, border } = useAppColors()

  const close = () => setMenuOpen(false)

  return (
    <>
      <Pressable onPress={() => setMenuOpen((v) => !v)} style={[{ padding: 8, position: 'absolute', top: position?.top, left: position?.left, right: position?.right, bottom: position?.bottom, zIndex: 1, backgroundColor, borderRadius: 100 }, style]}>
        <MoreVertical size={iconSize || 20} color={textColor} />
      </Pressable>

      {menuOpen && (
        <>
          <Pressable
            style={{ position: 'absolute', top: position?.top, left: 0, right: 0, bottom: position?.bottom, zIndex: 1 }}
            onPress={close}
          />
          <View
            style={{
              position: 'absolute',
              top: 15,
              right: 15,
              backgroundColor: cardBg,
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
              zIndex: 1,
            }}
          >
            <MenuContext.Provider value={{ close }}>
              {children}
            </MenuContext.Provider>
          </View>
        </>
      )}
    </>
  )
}

export function MenuItem({
  onPress,
  children,
}: {
  onPress: () => void
  children: React.ReactNode
}) {
  const ctx = useContext(MenuContext)

  function handlePress() {
    onPress()
    ctx?.close()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}
    >
      {children}
    </Pressable>
  )
}