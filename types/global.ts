import React from "react";
import { DimensionValue } from "react-native";

export type FieldProps = {
  label: string;
  value: string | undefined;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  style?: any;
  compact?: boolean;
  error?: string;
  onFocus?: () => void;
  readOnly?: boolean;
}

export type ModalProps = {
  value?: string | null | undefined;
  onChange: (data: string) => void;
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

