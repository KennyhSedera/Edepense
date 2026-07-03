import { useAppColors } from "@/hooks/useAppColors";
import { FieldProps } from "@/types/global";
import { Platform, StyleSheet, TextInput } from "react-native";
import { Text, View } from "react-native";

export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  style,
  compact,
  error,
  onFocus,
  readOnly,
  autoCapitalize,
}: FieldProps) {
  const { textColor, border, labelColor, inputBg, } = useAppColors();

  const handleFocus = () => {
    onFocus && onFocus()
  };
  return (
    <View style={[compact ? styles.fieldCompact : styles.field, style]}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={labelColor}
        keyboardType={keyboardType}
        multiline={multiline}
        onFocus={handleFocus}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          { color: error ? "red" : textColor, borderColor: error ? "red" : border, backgroundColor: inputBg },
        ]}
        readOnly={readOnly}
      />
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 14,
  },

  fieldCompact: {
    marginBottom: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 15,
  },

  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
});
