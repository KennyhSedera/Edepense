import * as ImagePicker from 'expo-image-picker';

export const takePhoto = async (setImage: (uri: string) => void) => {
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
      setImage(result.assets[0].uri);
    }
  } catch (error) {
    console.log(error);
  }
};

export const pickFromGallery = async (setImage: (uri: string) => void) => {
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
      setImage(result.assets[0].uri);
    }
  } catch (error) {
    console.log(error);

  }

};
