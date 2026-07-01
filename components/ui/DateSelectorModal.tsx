import { useAppColors } from "@/hooks/useAppColors";
import { buildYearRange, getDaysInMonth, MOIS_FR } from "@/utils/dateFormat";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

type Props = {
  visible: boolean;
  initialDate?: string;
  onConfirm: (isoDate: string) => void;
  onClose: () => void;
  inputBg?: string;
};

export default function DateSelectorModal({
  visible,
  initialDate,
  onConfirm,
  onClose,
  inputBg,
}: Props) {
  const today = new Date();

  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const { textColor, backgroundColor, border } = useAppColors();

  useEffect(() => {
    if (!visible) return;
    if (initialDate) {
      const parts = initialDate.split("-");
      if (parts.length === 3) {
        setSelectedYear(parseInt(parts[0], 10));
        setSelectedMonth(parseInt(parts[1], 10));
        setSelectedDay(parseInt(parts[2], 10));
        return;
      }
    }
    setSelectedDay(today.getDate());
    setSelectedMonth(today.getMonth() + 1);
    setSelectedYear(today.getFullYear());
  }, [visible, initialDate]);

  function handleSelectMonth(month: number) {
    setSelectedMonth(month);
    const maxDay = getDaysInMonth(selectedYear, month);
    if (selectedDay > maxDay) setSelectedDay(maxDay);
  }

  function handleSelectYear(year: number) {
    setSelectedYear(year);
    const maxDay = getDaysInMonth(year, selectedMonth);
    if (selectedDay > maxDay) setSelectedDay(maxDay);
  }

  function handleConfirm() {
    const maxDay = getDaysInMonth(selectedYear, selectedMonth);
    const day = Math.min(selectedDay, maxDay);
    const iso = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onConfirm(iso);
    onClose();
  }

  // FIX: handleClose ne fait plus que fermer — ne valide plus la date
  function handleClose() {
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      {/* FIX: GestureHandlerRootView isole l'arbre de gestes de la modale */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Pressable style={styles.overlay} onPress={handleClose}>
          {/* FIX: View + onStartShouldSetResponder au lieu de Pressable imbriqué */}
          <View
            style={[styles.sheet, { backgroundColor }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.title, { color: textColor }]}>Choisir une date</Text>

            <View style={styles.columnsRow}>
              {/* JOUR */}
              <View style={styles.column}>
                <Text style={[styles.columnLabel, { color: textColor }]}>Jour</Text>
                <ScrollView
                  style={[styles.scroll, { borderColor: border, backgroundColor: inputBg }]}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {Array.from(
                    { length: getDaysInMonth(selectedYear, selectedMonth) },
                    (_, i) => i + 1
                  ).map((day) => {
                    const active = selectedDay === day;
                    return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => setSelectedDay(day)}
                        style={[styles.item, active && { backgroundColor: "#006b96" }]}
                      >
                        <Text style={[styles.itemText, { color: active ? "#ffffff" : textColor }]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* MOIS */}
              <View style={styles.column}>
                <Text style={[styles.columnLabel, { color: textColor }]}>Mois</Text>
                <ScrollView
                  style={[styles.scroll, { borderColor: border, backgroundColor: inputBg }]}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {MOIS_FR.map((monthName, index) => {
                    const monthNumber = index + 1;
                    const active = selectedMonth === monthNumber;
                    return (
                      <TouchableOpacity
                        key={monthName}
                        onPress={() => handleSelectMonth(monthNumber)}
                        style={[styles.item, active && { backgroundColor: "#006b96" }]}
                      >
                        <Text style={[styles.itemText, { color: active ? "#ffffff" : textColor }]}>
                          {monthName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* ANNÉE */}
              <View style={[styles.column, { marginRight: 0 }]}>
                <Text style={[styles.columnLabel, { color: textColor }]}>Année</Text>
                <ScrollView
                  style={[styles.scroll, { borderColor: border, backgroundColor: inputBg }]}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {buildYearRange(today.getFullYear(), 5).map((year) => {
                    const active = selectedYear === year;
                    return (
                      <TouchableOpacity
                        key={year}
                        onPress={() => handleSelectYear(year)}
                        style={[styles.item, active && { backgroundColor: "#006b96" }]}
                      >
                        <Text style={[styles.itemText, { color: active ? "#ffffff" : textColor }]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: border }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: textColor }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#006b96" }]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>
                  Valider : {selectedDay} {MOIS_FR[selectedMonth - 1]} {selectedYear}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  sheet: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },

  columnsRow: {
    flexDirection: "row",
  },

  column: {
    flex: 1,
    marginRight: 8,
  },

  columnLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },

  scroll: {
    height: 160,
    borderWidth: 1,
    borderRadius: 8,
  },

  item: {
    paddingVertical: 8,
    alignItems: "center",
  },

  itemText: {
    fontSize: 18,
    fontWeight: "500",
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginRight: 8,
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  confirmButton: {
    flex: 2,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  confirmButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});