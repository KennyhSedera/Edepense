import React, { ReactNode } from "react";
import { ImageSourcePropType } from "react-native";
import { InputModeOptions, KeyboardType } from "react-native";
import { DimensionValue } from "react-native";
import { SharedValue } from "react-native-reanimated";

export type FieldProps = {
  label?: string;
  value: string | undefined;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardType;
  multiline?: boolean;
  style?: any;
  compact?: boolean;
  error?: string;
  onFocus?: () => void;
  readOnly?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export type ModalProps = {
  value?: string | null | undefined | number | Date | boolean | object | any | any[] | ImageSourcePropType;
  onChange: (data?: string | null | undefined | number | Date | boolean | object | any | any[]) => void;
  placeholder?: string;
  visible: boolean;
};

export type DeleteModalProps = {
  id?: string;
  visible: boolean;
  onChange: (action: string, id: string) => void;
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
};

export type PriceMode = "unit_price" | "total_price";