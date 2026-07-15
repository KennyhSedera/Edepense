import React, { useEffect, useState, useMemo } from "react";
import { View, Text } from "react-native";
import { CloudRain, Sun, Cloud, ChefHat, MapPin } from "lucide-react-native";
import * as Location from "expo-location";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";

interface MeteoData {
  temperature: number;
  condition: "pluie" | "soleil" | "nuageux";
  lieu?: string;
}

const SUGGESTIONS: Record<MeteoData["condition"], { icone: any; textes: string[]; couleur: string }> = {
  pluie: {
    icone: CloudRain,
    couleur: "#3b82f6",
    textes: [
      "Il pleut aujourd'hui — parfait pour une soupe ou un ragoût réconfortant 🍲",
      "Temps pluvieux — idéal pour un bon pot-au-feu qui mijote tranquillement 🍖",
      "Journée arrosée — une soupe chaude et un peu de riz feraient l'affaire 🍚",
      "Sous la pluie, rien de tel qu'un plat mijoté qui réchauffe la maison ☔",
    ],
  },
  soleil: {
    icone: Sun,
    couleur: "#f59e0b",
    textes: [
      "Belle journée ensoleillée — pense à une salade fraîche ou un barbecue 🥗",
      "Grand soleil aujourd'hui — profite-en pour un repas léger et frais 🍉",
      "Journée idéale pour grillades entre amis ou en famille 🍢",
      "Avec ce soleil, une salade de fruits frais fait toujours plaisir 🍓",
    ],
  },
  nuageux: {
    icone: Cloud,
    couleur: "#94a3b8",
    textes: [
      "Temps calme aujourd'hui — bon moment pour cuisiner un plat mijoté 🍛",
      "Ciel couvert — parfait pour tester une nouvelle recette à la maison 👨‍🍳",
      "Journée tranquille — l'occasion de préparer un bon gratin 🧀",
      "Temps nuageux — idéal pour un plat réconfortant en famille 🍜",
    ],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchMeteo(): Promise<MeteoData | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const position = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = position.coords;

    const [meteoResponse, geocode] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`),
      Location.reverseGeocodeAsync({ latitude, longitude }),
    ]);

    const data = await meteoResponse.json();

    const code = data.current.weather_code;
    let condition: MeteoData["condition"] = "nuageux";
    if (code >= 51 && code <= 82) condition = "pluie";
    else if (code === 0 || code === 1) condition = "soleil";

    const place = geocode[0];
    const lieu = place?.district || place?.city || place?.subregion || place?.region || undefined;

    return { temperature: data.current.temperature_2m, condition, lieu };
  } catch (err) {
    console.warn("Erreur météo:", err);
    return null;
  }
}

export default function MeteoSuggestion() {
  const { cardBg, border, textColor, labelColor } = useAppColors();
  const [meteo, setMeteo] = useState<MeteoData | null>(null);

  useEffect(() => {
    fetchMeteo().then(setMeteo);
  }, []);

  const texteSuggestion = useMemo(() => {
    if (!meteo) return null;
    return pickRandom(SUGGESTIONS[meteo.condition].textes);
  }, [meteo?.condition]);

  if (!meteo) return null;

  const suggestion = SUGGESTIONS[meteo.condition];
  const Icone = suggestion.icone;

  return (
    <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, borderRadius: 16, padding: 16, gap: 10, marginBottom: 0 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icone color={suggestion.couleur} size={20} />
          <Text style={{ fontSize: 14, fontWeight: "700", color: textColor }}>
            {meteo.temperature.toFixed(0)}°C aujourd'hui
          </Text>
        </View>

        {meteo.lieu && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 12, color: labelColor }}>{meteo.lieu}</Text>
            <MapPin color={labelColor} size={13} />
          </View>
        )}
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
        <ChefHat color={labelColor} size={16} style={{ marginTop: 2 }} />
        <Text style={{ color: labelColor, fontSize: 13, flex: 1, lineHeight: 19 }}>
          {texteSuggestion}
        </Text>
      </View>
    </View>
  );
}