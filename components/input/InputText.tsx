import { useAppColors } from "@/hooks/useAppColors";
import { InputTextProps } from "@/types/global";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, TextInputProps, StyleProp, TextStyle, ViewStyle } from "react-native";
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
  secureTextEntry,
  inputStyle,
}: InputTextProps) {
  const { textColor, border, labelColor, inputBg, } = useAppColors();

  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => {
    onFocus && onFocus()
  };
  return (
    <View style={[compact ? styles.fieldCompact : styles.field, style]}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <View style={[{ position: "relative" }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={labelColor}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={handleFocus}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry && !showPassword}
          style={[
            styles.input,
            multiline && styles.inputMultiline && { height: "auto" },
            { color: error ? "red" : textColor, borderColor: error ? "red" : border, backgroundColor: inputBg },
            inputStyle,
          ]}
          readOnly={readOnly}
        />
        {secureTextEntry &&
          <Pressable onPress={() => setShowPassword(!showPassword)} style={{ position: "absolute", top: 15, right: 10 }}>
            {showPassword ? (
              <EyeOff size={18} color={labelColor} />
            ) : (
              <Eye size={18} color={labelColor} />
            )}
          </Pressable>
        }
      </View>
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
    overflow: "hidden",
  },

  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
});
