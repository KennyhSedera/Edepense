import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { HeaderWithSearch } from './_layout'
import { MainHeader } from '@/components/header/header-main'
import { useHours } from '@/hooks/useHour';
import { useAppColors } from '@/hooks/useAppColors';
import { styles as style } from "@/styles/styles";
import Toggle from '@/components/input/Toggle';

export default function SettingScreen() {
  const { textColor, backgroundColor, border, cardBg, isDark, sectionColor, labelColor } = useAppColors();

  const {
    hour,
    enabled,
    disableNotifications,
    enableNotifications,
    handleHourChange
  } = useHours();

  const handleToggle = async (value: boolean) => {
    value ? await enableNotifications() : await disableNotifications();
  }

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Paramètres" />}
    >

      <View style={{ padding: 10, borderRadius: 10, backgroundColor: cardBg, borderColor: border, borderWidth: 1, marginBottom: 10 }}>
        <View style={[style.rowSpacing, enabled && { marginBottom: 15 }]}>
          <Text style={[style.label, { color: textColor, marginLeft: 5, fontSize: 16, marginBottom: 0 }]}>Rappel quotidien</Text>
          <Toggle value={enabled} onChange={handleToggle} />
        </View>

        {enabled && (
          <View style={[style.chipsWrap]}>
            {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => handleHourChange(h)}
                style={{
                  width: "18%",
                  padding: 8,
                  alignItems: "center",
                  borderRadius: 8,
                  backgroundColor: hour === h ? sectionColor : backgroundColor,
                }}
              >
                <Text style={{ color: hour === h ? '#fff' : textColor }}>{h}h</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </MainHeader>
  )
}