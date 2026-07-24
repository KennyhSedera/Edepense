import { LucideIcon } from "lucide-react-native";
import React, { ReactNode } from "react";
import { ImageSourcePropType, ImageStyle, StyleProp, TextInputProps, TextStyle } from "react-native";
import { ViewStyle } from "react-native";
import { InputModeOptions, KeyboardType } from "react-native";
import { DimensionValue } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { Message } from "./db";

type FieldProps = {
  label?: string;
  value: string | undefined;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardType;
  multiline?: boolean;
  style?: ViewStyle | TextStyle | ImageStyle;
  compact?: boolean;
  error?: string;
  onFocus?: () => void;
  readOnly?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  inputMode?: InputModeOptions;
  inputStyle?: ViewStyle | TextStyle | ImageStyle;
}

export type InputTextProps = Omit<FieldProps, "style" | "inputStyle"> & {
  secureTextEntry?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
} & Omit<TextInputProps, "style">;

export type ModalProps = {
  value?: string | null | undefined | number | Date | boolean | object | any | any[] | ImageSourcePropType;
  onChange: (data?: string | null | undefined | number | Date | boolean | object | any | any[]) => void;
  placeholder?: string;
  visible: boolean;
  children?: ReactNode;
};

export type DeleteModalProps = {
  id?: string;
  visible: boolean;
  onChange: (action?: string | undefined, id?: string | undefined) => void | Promise<void>;
  message?: string;
}

export type InputProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  style?: any;
  compact?: boolean;
  error?: string;
  onFocus?: () => void;
};

export type EmptyDataProps = {
  icon?: React.ReactNode;
  message: string | React.ReactNode;
};

export type Position = {
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
  width?: DimensionValue | undefined;
  height?: DimensionValue | undefined;
}

type SelectItem = string | {
  value: string;
  label: string;
};

export type SelectProps = {
  label?: string;
  value: string | undefined;
  data: SelectItem[];
  setValue: (v: string) => void;
  style?: any;
  position?: Position;
}

export type SendNotifProps = {
  params?: any,
  route?: string,
  title: string,
  body: string
}

export type AnimateHeaderProps = {
  children: ReactNode;
  header: (
    scrollY: SharedValue<number>
  ) => ReactNode;
  maxHeight?: number;
  minHeight?: number;
  marginBottomMax?: number;
  marginBottomMin?: number;
  topTitle?: boolean;
};

export type PriceMode = "unit_price" | "total_price";

export interface ReceiptItem {
  description: string;
  amount: string;
  quantity: string | null;
  unit: string | null;
}

export interface ParsedReceipt {
  rawText: string;
  total: string | null;
  currency: string | null;
  date: string | null;
  merchant: string | null;
  observation: string | null;
  items: ReceiptItem[];
  isUncertain: boolean;
  categorie: string | null;
}

export interface FichierAudioInfo {
  uri: string;
  nom: string;
  tailleOctets: number;
  dateModification: number;
}

export interface AudioDepense {
  uri: string;
  depenseId: string;
  description?: string;
  categorie?: string;
  montant: number;
  date: string;
}

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

export interface InputSelectProps<T extends string = string> {
  label?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  onFocus?: () => void;
}

export type CardMenuProps = {
  title: string,
  color?: string,
  iconColor?: string,
  onPress: () => void
  Icon: LucideIcon | React.ComponentType<any>,
}

export type FooterMessageProps = {
  text?: string,
  textToResponse?: Message | null,
  setImage?: (uri: string) => void,
  setText?: (text: string) => void,
  setSound?: (uri: string) => void,
  onClearResponse?: () => void
}

export type SelectChipsMultiProps = {
  data: (string | { label: string; value: string })[];
  values: string[];
  setValues: (values: string[]) => void;
  label?: string;
  groupes?: Record<string, string[]>;
};