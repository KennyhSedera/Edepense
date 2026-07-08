import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ToastAndroid } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAppColors } from '@/hooks/useAppColors';
import EmptyData from '@/components/ui/empty-data';
import { Mic, MicOffIcon, Trash2Icon } from 'lucide-react-native';
import { LecteurAudio } from '@/components/audio/LecteurAudio';
import { FichierAudioInfo } from '@/types/global';
import { listerFichiersAudioBruts, supprimerAudio } from '@/utils/voice.util';
import { MainHeader } from '@/components/header/header-main';
import { HeaderWithSearch } from './_layout';
import { styles } from '@/styles/styles';

export default function ListeNotesVocales() {
  const { textColor, labelColor, cardBg, border, dangerColor } = useAppColors();
  const [audios, setAudios] = useState<FichierAudioInfo[]>([]);
  const [loading, setLoading] = useState(true);

  function loadAudios() {
    setLoading(true);
    listerFichiersAudioBruts()
      .then(setAudios)
      .finally(() => setLoading(false));
  }

  useFocusEffect(
    useCallback(() => {
      loadAudios();
    }, [])
  );

  function deleteAudio(uri: string) {
    try {
      supprimerAudio(uri)
      loadAudios()
      ToastAndroid.show('Note vocale supprimée', ToastAndroid.SHORT)
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Notification" />}
    >
      {!loading && audios.length === 0
        && (
          <EmptyData
            icon={<MicOffIcon size={50} color={labelColor} />}
            message="Aucune note vocale enregistrée pour le moment."
          />
        )
      }
      {audios.map((item, i) => (
        <View
          key={i}
          style={{
            backgroundColor: cardBg,
            borderColor: border,
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            gap: 8,
            marginTop: 8,
            position: 'relative'
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: textColor, fontWeight: '600', fontSize: 13 }} numberOfLines={1}>
              {item.nom || 'Note vocale'}
            </Text>
            <Text style={{ color: labelColor, fontSize: 12 }}>
              {new Date(item.dateModification).toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <LecteurAudio uri={item.uri} />
          <Pressable onPress={() => deleteAudio(item.uri)} style={[styles.iconButton, { position: 'absolute', bottom: 6, right: 6, backgroundColor: dangerColor, padding: 6 }]}>
            <Trash2Icon size={14} color={"#fff"} />
          </Pressable>
        </View>))}
    </MainHeader>
  );
}