import { DOSSIER_IMAGES } from '@/constants/storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { FichierAudioInfo } from '@/types/global';

const takePhoto = async (setImage: (uri: string) => void) => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      console.warn('Permission caméra refusée');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = await sauvegarderImageDefinitivement(result.assets[0].uri) as unknown as string;
      setImage(uri);
    }
  } catch (error) {
    console.log(error);
  }
};

const pickFromGallery = async (setImage: (uri: string) => void) => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      console.warn('Permission galerie refusée');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = await sauvegarderImageDefinitivement(result.assets[0].uri) as unknown as string;
      setImage(uri);
    }
  } catch (error) {
    console.log(error);

  }

};

async function assurerDossierExiste() {
  const infos = await FileSystem.getInfoAsync(DOSSIER_IMAGES);
  if (!infos.exists) {
    await FileSystem.makeDirectoryAsync(DOSSIER_IMAGES, { intermediates: true });
  }
}

async function sauvegarderImageDefinitivement(uriTemporaire: string): Promise<string> {
  await assurerDossierExiste();

  const nomFichier = `image_${Date.now()}.jpg`;
  const cheminFinal = `${DOSSIER_IMAGES}${nomFichier}`;

  await FileSystem.copyAsync({
    from: uriTemporaire,
    to: cheminFinal,
  });

  return cheminFinal;
}

async function supprimerImage(uri: string | null | undefined): Promise<boolean> {
  if (!uri) return false;

  if (!uri.startsWith(DOSSIER_IMAGES)) {
    console.warn('supprimerImage: chemin hors du dossier images, suppression ignorée:', uri);
    return false;
  }

  try {
    const infos = await FileSystem.getInfoAsync(uri);
    if (!infos.exists) return false;

    await FileSystem.deleteAsync(uri, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Erreur suppression image:', error);
    return false;
  }
}

async function removeImages(uri: string[]): Promise<boolean> {
  await assurerDossierExiste();
  try {
    await Promise.all(uri.map((uri) => supprimerImage(uri)));
    return true;
  } catch (error) {
    console.error('Erreur suppression image:', error);
    return false;
  }
}


async function listerFichiersImageBruts(): Promise<FichierAudioInfo[]> {
  await assurerDossierExiste();

  const noms = await FileSystem.readDirectoryAsync(DOSSIER_IMAGES);

  const infos = await Promise.all(
    noms.map(async (nom) => {
      const uri = `${DOSSIER_IMAGES}${nom}`;
      const detail = await FileSystem.getInfoAsync(uri, { size: true });

      return {
        uri,
        nom,
        tailleOctets: detail.exists ? (detail.size ?? 0) : 0,
        dateModification: detail.exists ? (detail.modificationTime ?? 0) * 1000 : 0,
      };
    })
  );

  return infos.sort((a, b) => b.dateModification - a.dateModification);
}

export { takePhoto, pickFromGallery, sauvegarderImageDefinitivement, supprimerImage, listerFichiersImageBruts, removeImages };