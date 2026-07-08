import { View } from 'react-native'
import React from 'react'
import { useAppColors } from '@/hooks/useAppColors';

export default function BarAudio({ progression, barHeights, backgroundColor }: { progression: number, barHeights: number[], backgroundColor?: string }) {
  const { border, sectionColor } = useAppColors();

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 3
    }}>
      {barHeights.map((height, i) => {
        const barStart = (i / barHeights.length) * 100;
        const barEnd = ((i + 1) / barHeights.length) * 100;

        let fill = 0;

        if (progression >= barEnd) {
          fill = 100;
        } else if (progression > barStart) {
          fill = ((progression - barStart) / (barEnd - barStart)) * 100;
        }

        return (
          <View
            key={i}
            style={{
              width: 3,
              height,
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: border,
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: `${fill}%`,
                backgroundColor: backgroundColor || sectionColor,
              }}
            />
          </View>
        );
      })}
    </View>
  )
}