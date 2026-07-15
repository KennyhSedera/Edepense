import { ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";
import { GoalFrequency } from "@/types/db";

async function copierTexte(text: string, message?: string) {
  await Clipboard.setStringAsync(text);
  ToastAndroid.show(message || "Texte copié", ToastAndroid.SHORT);
}

function formatFrequenceSuffix(frequence?: GoalFrequency): string {
  switch (frequence) {
    case "journalier":
      return "/jour";
    case "hebdomadaire":
      return "/semaine";
    case "mensuel":
      return "/mois";
    case "unique":
    default:
      return "";
  }
}

export { copierTexte, formatFrequenceSuffix };