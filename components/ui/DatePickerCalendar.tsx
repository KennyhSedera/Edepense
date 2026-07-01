import { useAppColors } from "@/hooks/useAppColors";
import React, { useState } from "react";
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
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

export type Props = {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  visible: boolean;
};

export default function DatePickerModal({
  value,
  onChange,
  visible,
}: Props) {
  const [] = useState(false);

  const { textColor, backgroundColor, border, isDark, sectionColor } = useAppColors();

  const selectedDate =
    value || new Date().toISOString().split("T")[0];

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
            <Calendar
              firstDay={1}
              current={selectedDate}
              onDayPress={(day: any) => {
                onChange(day.dateString);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: sectionColor,
                },
              }}
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
});