import { View, Text, Modal, Pressable, Image, FlatList, useWindowDimensions } from 'react-native'
import React, { useRef, useState, useEffect } from 'react'
import { ModalProps } from '@/types/global'
import { styles } from '@/styles/styles'
import { BlurView } from 'expo-blur'
import { useAppColors } from '@/hooks/useAppColors'
import { LucideX } from 'lucide-react-native'
import { DIMENSION } from '@/constants/type'

type ImageValue = string | { uri: string } | number

export default function RenderImage({ value, onChange, visible, initialIndex = 0 }: ModalProps & { initialIndex?: number }) {
  const { isDark, dangerColor } = useAppColors();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  const isEmpty = !value || (Array.isArray(value) && value.length === 0);

  useEffect(() => {
    if (isEmpty && visible) onChange(false);
  }, [isEmpty, visible]);

  if (isEmpty) return null;

  const images: ImageValue[] = Array.isArray(value) ? value : [value];
  const toSource = (img: ImageValue) => (typeof img === "string" ? { uri: img } : img);

  const handleClose = () => {
    setIndex(0);
    onChange(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={[{ height: "100%" }]}>
        <View style={[styles.infoGridFull, { backgroundColor: "#000000f1", padding: 0, height: "100%", justifyContent: "center", position: 'relative', paddingVertical: 50 }]}>
          <FlatList
            ref={listRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={{ width, height: DIMENSION.height - 100, justifyContent: 'center' }}>
                <Image source={toSource(item)} resizeMode='contain' style={{ width: "100%", height: "100%" }} />
              </View>
            )}
          />

          {images.length > 1 && (
            <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', flexDirection: 'row', gap: 6 }}>
              {images.map((_, i) => (
                <View key={i} style={{ width: i === index ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === index ? "#fff" : "#ffffff66" }} />
              ))}
            </View>
          )}

          {images.length > 1 && (
            <View style={{ position: 'absolute', top: 20, alignSelf: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>{index + 1} / {images.length}</Text>
            </View>
          )}

          <Pressable onPress={handleClose} style={{ position: "absolute", top: 10, right: 10, zIndex: 1, padding: 6, borderRadius: 100, backgroundColor: "#ffffff4f" }}>
            <LucideX size={15} color={"#fff"} />
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  )
}