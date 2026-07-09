import { View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useAppColors } from '@/hooks/useAppColors';

const HAUTEUR_BARRE = 36;
const HAUTEUR_MIN = 4;

export default function BarAudioAnimed({
  isPlaying,
  isPaused,
  progression,
  totalBar = 40,
}: {
  isPlaying: boolean;
  isPaused: boolean;
  progression: number;
  totalBar?: number;
}) {
  const { border, sectionColor } = useAppColors();

  const barAnims = useRef(
    Array.from({ length: totalBar }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    if (isPlaying && !isPaused) {
      const loops = barAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 250 + (i % 5) * 60,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.5 + 0.15,
              duration: 250 + (i % 5) * 60,
              useNativeDriver: true,
            }),
          ])
        )
      );
      loops.forEach((l) => l.start());
      return () => loops.forEach((l) => l.stop());
    } else if (!isPlaying && !isPaused) {
      barAnims.forEach((anim) => anim.setValue(0.2));
    }
  }, [isPlaying, isPaused]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        gap: 3,
        height: HAUTEUR_BARRE,
        opacity: isPaused ? 0.4 : 1,
      }}
    >
      {barAnims.map((anim, i) => {
        const barStart = (i / barAnims.length) * 100;
        const barEnd = ((i + 1) / barAnims.length) * 100;

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
              height: HAUTEUR_BARRE,
              justifyContent: 'flex-end',
            }}
          >
            <Animated.View
              style={{
                width: 3,
                height: HAUTEUR_BARRE,
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: border,
                transform: [
                  {
                    scaleY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [HAUTEUR_MIN / HAUTEUR_BARRE, 1],
                    }),
                  },
                ],
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '100%',
                  width: `${fill}%`,
                  backgroundColor: sectionColor,
                }}
              />
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
}