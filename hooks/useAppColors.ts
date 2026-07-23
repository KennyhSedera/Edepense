import { useTheme } from "@react-navigation/native";
import { Colors } from "@/constants/Colors";

export function useAppColors(appTheme?: "light" | "dark") {
  const theme = appTheme === "dark" ? true : appTheme === "light" ? false : appTheme || useTheme();

  const isDark = typeof theme === "boolean" ? theme : theme?.dark ?? true;

  const colorScheme = isDark ? "dark" : "light";

  const colors = Colors[colorScheme];

  return {
    isDark,
    colorScheme,

    textColor: colors.text,
    backgroundColor: colors.background,
    tintColor: colors.tint,
    border: colors.border,

    iconColor: colors.icon,
    tabIconDefault: colors.tabIconDefault,
    tabIconSelected: colors.tabIconSelected,

    gradient: {
      from: colors.from,
      to: colors.to,
      middle: colors.middle,
    },

    primary: colors.primary,
    secondary: colors.secondary,

    cardBg: colors.cardBg,
    labelColor: colors.labelColor,
    sectionColor: colors.sectionColor,
    inputBg: colors.inputBg,
    dangerColor: colors.dangerColor,
    successColor: colors.successColor,
    focusedColor: colors.focusedColor,
    itemBg: colors.itemBg,
    info: colors.info,
    warning: colors.warning,
    white: colors.white,
  };
}