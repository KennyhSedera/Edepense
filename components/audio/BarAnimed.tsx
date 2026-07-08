import { View, Text, Animated } from 'react-native'
import React from 'react'

export default function BarAnimed({ barAnims, isRecording, isPaused, sectionColor, border }: { barAnims: Animated.Value[]; isRecording: boolean; isPaused: boolean; sectionColor: string; border: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        height: 40,
        opacity: isPaused ? 0.4 : 1,
      }}
    >
      {barAnims.map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            backgroundColor: isRecording ? sectionColor : border,
            height: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [4, 36],
            }),
          }}
        />
      ))}
    </View>
  )
}