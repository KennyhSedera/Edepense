import { View, Text, Image, Pressable, ToastAndroid } from 'react-native'
import React from 'react'
import { MainHeader } from '@/components/header/header-main'
import { HeaderWithSearch } from './_layout'
import { useAppColors } from '@/hooks/useAppColors';
import { FichierAudioInfo } from '@/types/global';
import { listerFichiersImageBruts, removeImages } from '@/utils/image.util';
import { styles } from '@/styles/styles';
import { formatDateLong } from '@/utils/date.util';
import RenderImage from '@/components/modal/render-image';

export default function ImageEnregistrer() {
  const { textColor, backgroundColor, border, sectionColor, successColor, dangerColor, white } = useAppColors();
  const [images, setImages] = React.useState<FichierAudioInfo[] | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [imgSelected, setImgSelected] = React.useState<FichierAudioInfo[] | null>(null);

  async function getImages() {
    const images = await listerFichiersImageBruts();
    setImages(images);
  }

  React.useEffect(() => {
    getImages();
  }, []);

  const openImage = (index: number) => {
    setSelectedIndex(index);
    setVisible(true);
  };

  function handleSelectImage(params: FichierAudioInfo) {
    if (imgSelected?.find(i => i.uri === params.uri)) {
      setImgSelected(imgSelected?.filter(i => i.uri !== params.uri));
    } else {
      setImgSelected([...imgSelected ?? [], params]);
    }
  }

  function handlePressImg(image: FichierAudioInfo, index: number) {
    imgSelected?.length ? handleSelectImage(image) : openImage(index);
  }

  async function handleDeleteMany() {
    if (imgSelected?.length as number > 0) {
      const selected = imgSelected as FichierAudioInfo[];
      const count = selected?.length;
      await removeImages(selected.map(i => i.uri)).then(() => {
        getImages();
        setImgSelected(null);
        ToastAndroid.show(`Vous avez supprimé ${count} image(s).`, ToastAndroid.SHORT);
      });
    }
  }

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Image enregistrer" />}
      fab={(imgSelected?.length ?? 0) > 0 ? <View style={[{ width: "100%", position: 'absolute', bottom: 0, paddingHorizontal: 20, zIndex: 1 }]}>
        <Pressable onPress={handleDeleteMany} style={[styles.miniButton, styles.infoGridFull, { backgroundColor: dangerColor, borderColor: border, zIndex: 1 }]}>
          <Text style={{ color: white }}>Supprimer {imgSelected?.length} image(s)</Text>
        </Pressable>
      </View> : null
      }
    >

      <RenderImage
        onChange={setVisible}
        visible={visible}
        value={images?.map(i => i.uri)}
        initialIndex={selectedIndex}
      />
      <View style={[styles.infoGrid]}>
        {images?.map((image, index) => {
          const isSelected = imgSelected?.find((i) => i.uri === image.uri);
          const num = imgSelected?.findIndex((i) => i.uri === image.uri);
          return (
            <Pressable
              key={index}
              onPress={() => handlePressImg(image, index)}
              onLongPress={() => handleSelectImage(image)}
              style={[styles.card, styles.infoGridHalf, { backgroundColor: backgroundColor, borderColor: isSelected ? sectionColor : border, marginBottom: 0 }]}
            >
              {num !== undefined && isSelected && (num >= 0) &&
                <View style={[styles.centered, { position: "absolute", top: 5, right: 5, backgroundColor: successColor, width: 30, height: 30, borderRadius: 30, zIndex: 1 }]}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>{num + 1}</Text>
                </View>

              }
              <Image source={{ uri: image.uri }} style={{ width: "100%", height: 150, borderRadius: 10 }} resizeMode="cover" />
              <View style={[styles.rowSpacing, { paddingHorizontal: 10, marginVertical: 10 }]}>
                <Text style={{ color: textColor }}>
                  {formatDateLong(new Date(image.dateModification).toISOString())}
                </Text>
                <Text style={{ color: textColor }}>{`(${(image.tailleOctets / (1024 * 1024)).toFixed(2)} Mo)`}</Text>
              </View>
            </Pressable>
          )
        })}
      </View>
    </MainHeader>
  )
}