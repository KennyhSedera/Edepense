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

export function normaliser(texte: string | null | undefined): string {
  if (!texte) return "";

  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s-]/g, "")
    .split(" ")
    .map(singulariser)
    .join(" ");
}

export function singulariser(mot: string): string {
  if (!mot) return mot;

  const exceptions = new Set([
    "bus", "gaz", "repas", "sans", "plus", "sous", "tissus", "hygiene",
  ]);
  if (exceptions.has(mot)) return mot;

  if (mot.endsWith("aux") && mot.length > 4) {
    return mot.slice(0, -3) + "al";
  }

  if ((mot.endsWith("s") || mot.endsWith("x")) && mot.length > 3) {
    return mot.slice(0, -1);
  }

  return mot;
}

export function categoriesEquivalentes(a: string | null | undefined, b: string | null | undefined): boolean {
  return normaliser(a) === normaliser(b);
}

export { copierTexte, formatFrequenceSuffix };