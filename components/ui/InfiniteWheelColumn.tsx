import React, { useRef, useCallback, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";

const ITEM_HEIGHT = 40;
const REPEAT_COUNT = 20;

type Props = {
  data: (string | number)[];
  selectedIndex: number;
  onChangeIndex: (index: number) => void;
  textColor: string;
  border?: string;
  backgroundColor?: string;
  activeColor?: string;
  style?: any;
};

export function InfiniteWheelColumn({
  data,
  selectedIndex,
  onChangeIndex,
  textColor,
  border,
  backgroundColor,
  activeColor = "#006b96",
  style,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const n = data.length;
  const centerBlock = Math.floor(REPEAT_COUNT / 2);

  const VISIBLE_ITEMS = 5;
  const HALF = Math.floor(VISIBLE_ITEMS / 2);

  // position dans le bloc central
  const offsetForIndex = useCallback(
    (index: number) => (centerBlock * n + index) * ITEM_HEIGHT,
    [centerBlock, n]
  );

  // scroll initial centré
  const initialOffset = offsetForIndex(selectedIndex);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: initialOffset,
      animated: false,
    });
  }, [initialOffset]);

  function handleScroll(e: any) {
    const y = e.nativeEvent.contentOffset.y;

    // correction centrage (IMPORTANT)
    const rawIndex = Math.round(y / ITEM_HEIGHT);
    const realIndex = ((rawIndex % n) + n) % n;

    if (realIndex !== selectedIndex) {
      onChangeIndex(realIndex);
    }

    // reset position si proche des bords
    const currentBlock = Math.floor(rawIndex / n);

    if (currentBlock < 3 || currentBlock > REPEAT_COUNT - 3) {
      const newY = offsetForIndex(realIndex);
      scrollRef.current?.scrollTo({
        y: newY,
        animated: false,
      });
    }
  }

  function handlePressItem(index: number) {
    onChangeIndex(index);

    scrollRef.current?.scrollTo({
      y: offsetForIndex(index),
      animated: true,
    });
  }

  const fullList = Array.from({ length: REPEAT_COUNT * n }, (_, i) => {
    const realIndex = i % n;
    return {
      key: `${i}`,
      value: data[realIndex],
      realIndex,
    };
  });

  return (
    <ScrollView
      ref={scrollRef}
      style={[
        {
          height: ITEM_HEIGHT * VISIBLE_ITEMS,
          borderRadius: 8,
          position: "relative",
        },
        { borderColor: border, backgroundColor },
        style,
      ]}
      contentContainerStyle={{
        paddingVertical: ITEM_HEIGHT * HALF,
      }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      onMomentumScrollEnd={handleScroll}
    >
      {fullList.map((entry) => {
        const active = entry.realIndex === selectedIndex;

        return (
          <TouchableOpacity
            key={entry.key}
            onPress={() => handlePressItem(entry.realIndex)}
            style={{
              height: ITEM_HEIGHT,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: active ? 1 : 0,
              borderColor: active ? activeColor : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: active ? "700" : "500",
                color: active ? activeColor : textColor,
              }}
            >
              {entry.value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
