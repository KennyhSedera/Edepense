import React, { useState } from "react";
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from "react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { ChevronDown, Check } from "lucide-react-native";
import { InputSelectProps } from "@/types/global";
import { styles } from "@/styles/styles";


export default function InputSelect<T extends string = string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Sélectionner...",
  error,
  onFocus,
}: InputSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const {
    labelColor,
    textColor,
    border,
    inputBg,
    cardBg,
    sectionColor,
    dangerColor,
  } = useAppColors();

  const selected = options.find((o) => o.value === value);

  function handleOpen() {
    onFocus?.();
    setOpen(true);
  }

  function handleSelect(optionValue: T) {
    onChange(optionValue);
    setOpen(false);
  }

  return (
    <View style={styles.field}>
      {label ? (
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      ) : null}

      <Pressable
        onPress={handleOpen}
        style={[
          styles.input,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: inputBg,
            borderColor: error ? dangerColor : border,
            paddingVertical: 12,
          },
        ]}
      >
        <Text
          style={{
            color: selected ? textColor : labelColor,
            fontSize: 15,
          }}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={18} color={textColor} />
      </Pressable>

      {error ? (
        <Text style={[styles.error, { color: dangerColor }]}>{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlaySelected} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: cardBg, borderColor: border }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: border }} />
              )}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => handleSelect(item.value)}
                    style={styles.option}
                  >
                    <Text
                      style={{
                        color: isSelected ? sectionColor : textColor,
                        fontSize: 15,
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {item.label}
                    </Text>
                    {isSelected ? (
                      <Check size={18} color={sectionColor} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
