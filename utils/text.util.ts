import { ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";

async function copierTexte(text: string, message?: string) {
  await Clipboard.setStringAsync(text);
  ToastAndroid.show(message || "Texte copié", ToastAndroid.SHORT);
}

export { copierTexte };