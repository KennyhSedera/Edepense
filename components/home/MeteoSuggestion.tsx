import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { CloudRain, Sun, Cloud, ChefHat } from "lucide-react-native";
import * as Location from "expo-location";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";

interface MeteoData {
  temperature: number;
  condition: "pluie" | "soleil" | "nuageux";
}

const SUGGESTIONS: Record<MeteoData["condition"], { icone: any; texte: string; couleur: string }> = {
  pluie: {
    icone: CloudRain,
    texte: "Il pleut aujourd'hui — parfait pour une soupe ou un ragoût réconfortant 🍲",
    couleur: "#3b82f6",
  },
  soleil: {
    icone: Sun,
    texte: "Belle journée ensoleillée — pense à une salade fraîche ou un barbecue 🥗",
    couleur: "#f59e0b",
  },
  nuageux: {
    icone: Cloud,
    texte: "Temps calme aujourd'hui — bon moment pour cuisiner un plat mijoté",
    couleur: "#94a3b8",
  },
};

async function fetchMeteo(): Promise<MeteoData | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const position = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = position.coords;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
    );
    const data = await response.json();

    const code = data.current.weather_code;
    let condition: MeteoData["condition"] = "nuageux";
    if (code >= 51 && code <= 82) condition = "pluie";
    else if (code === 0 || code === 1) condition = "soleil";

    return { temperature: data.current.temperature_2m, condition };
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

  if (!meteo) return null;

  const suggestion = SUGGESTIONS[meteo.condition];
  const Icone = suggestion.icone;

  return (
    <View style={[styles.card, styles.infoGridFull, { backgroundColor: cardBg, borderColor: border, borderRadius: 16, padding: 16, gap: 10 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icone color={suggestion.couleur} size={20} />
        <Text style={{ fontSize: 14, fontWeight: "700", color: textColor }}>
          {meteo.temperature.toFixed(0)}°C aujourd'hui
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
        <ChefHat color={labelColor} size={16} style={{ marginTop: 2 }} />
        <Text style={{ color: labelColor, fontSize: 13, flex: 1, lineHeight: 19 }}>
          {suggestion.texte}
        </Text>
      </View>
    </View>
  );
}