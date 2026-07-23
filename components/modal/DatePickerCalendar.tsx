import { useAppColors } from "@/hooks/useAppColors";
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ],
  monthNamesShort: [
    "Jan.", "Fév.", "Mars", "Avr.", "Mai", "Juin",
    "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.",
  ],
  dayNames: [
    "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
  ],
  dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "fr";

const MOIS_COURT = LocaleConfig.locales["fr"].monthNamesShort;
const MOIS_LONG = LocaleConfig.locales["fr"].monthNames;

export type Props = {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  visible: boolean;
};

type Mode = "jour" | "mois" | "annee";

export default function DatePickerModal({
  value,
  onChange,
  visible,
}: Props) {
  const { textColor, backgroundColor, border, isDark, sectionColor } = useAppColors();

  const selectedDate = value || new Date().toISOString().split("T")[0];
  const [current, setCurrent] = useState(selectedDate);
  const [mode, setMode] = useState<Mode>("jour");

  const currentYear = parseInt(current.split("-")[0], 10);
  const currentMonth = parseInt(current.split("-")[1], 10) - 1;

  const anneeDebut = currentYear - 5;
  const annees = Array.from({ length: 12 }, (_, i) => anneeDebut + i);

  const changerMois = (moisIndex: number) => {
    const nouvelleDate = `${currentYear}-${String(moisIndex + 1).padStart(2, "0")}-01`;
    setCurrent(nouvelleDate);
    setMode("jour");
  };

  const changerAnnee = (annee: number) => {
    const nouvelleDate = `${annee}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    setCurrent(nouvelleDate);
    setMode("jour");
  };

  return (
    <View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => onChange(selectedDate || "")}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => onChange(selectedDate || "")}
        >
          <Pressable
            style={[styles.modal, { backgroundColor, borderColor: isDark ? border : textColor }]}
            onPress={(e) => e.stopPropagation()}
          >
            {mode === "jour" && (
              <Calendar
                firstDay={1}
                current={current}
                onDayPress={(day: any) => {
                  onChange(day.dateString);
                }}
                onMonthChange={(month: any) => {
                  setCurrent(month.dateString);
                }}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    selectedColor: sectionColor,
                  },
                }}
                renderHeader={() => (
                  <View style={styles.headerRow}>
                    <Pressable onPress={() => setMode("mois")}>
                      <Text style={[styles.headerText, { color: sectionColor }]}>
                        {MOIS_LONG[currentMonth]}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => setMode("annee")}>
                      <Text style={[styles.headerText, { color: sectionColor }]}>
                        {currentYear}
                      </Text>
                    </Pressable>
                  </View>
                )}
                theme={{
                  selectedDayBackgroundColor: sectionColor,
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: sectionColor,
                  arrowColor: sectionColor,
                  monthTextColor: sectionColor,
                  textMonthFontWeight: "bold",
                  dayHeaderStyle: {
                    color: sectionColor,
                    fontWeight: "bold",
                    fontSize: 14,
                  },
                  dayTextColor: textColor,
                  textDayFontWeight: "bold",
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 12,
                  calendarBackground: backgroundColor,
                }}
                style={{
                  backgroundColor: backgroundColor,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              />
            )}

            {mode === "mois" && (
              <View style={styles.pickerContainer}>
                <Text style={[styles.gridTitle, { color: sectionColor }]}>Sélectionner un mois</Text>
                <View style={styles.grid}>
                  {MOIS_COURT.map((m: string, index: number) => (
                    <Pressable
                      key={m}
                      style={[
                        styles.gridItem,
                        index === currentMonth && { backgroundColor: sectionColor },
                      ]}
                      onPress={() => changerMois(index)}
                    >
                      <Text
                        style={[
                          styles.gridItemText,
                          { color: index === currentMonth ? "#fff" : textColor },
                        ]}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {mode === "annee" && (
              <View style={styles.pickerContainer}>
                <Text style={[styles.gridTitle, { color: sectionColor }]}>Sélectionner une année</Text>
                <ScrollView
                  style={{ maxHeight: 300 }}
                  contentContainerStyle={styles.grid}
                  showsVerticalScrollIndicator={false}
                >
                  {annees.map((a) => (
                    <Pressable
                      key={a}
                      style={[
                        styles.gridItem,
                        a === currentYear && { backgroundColor: sectionColor },
                      ]}
                      onPress={() => changerAnnee(a)}
                    >
                      <Text
                        style={[
                          styles.gridItemText,
                          { color: a === currentYear ? "#fff" : textColor },
                        ]}
                      >
                        {a}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    borderRadius: 12,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerContainer: {
    padding: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  gridItem: {
    width: 70,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  gridItemText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  gridTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
});