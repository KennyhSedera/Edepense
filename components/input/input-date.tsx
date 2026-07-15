import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import { styles } from '@/styles/styles'
import { useAppColors } from '@/hooks/useAppColors';
import { formatDateLong } from '@/utils/date.util';
import DatePickerCalendar from '@/components/modal/DatePickerCalendar';

export default function InputDate({ label, value, onChange, onFocus, error }: any) {
  const { textColor, border, labelColor, inputBg, } = useAppColors();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const closeDatePicker = (value: string) => {
    onChange(value);
    setShowDatePicker(false)
  };

  const openDatePicker = () => {
    onFocus && onFocus();
    setShowDatePicker(true);
  };

  return (
    <View>
      <DatePickerCalendar value={value} onChange={closeDatePicker} visible={showDatePicker} />
      <Pressable style={[styles.field]} onPress={openDatePicker}>
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <Text style={[styles.input, { backgroundColor: inputBg, color: error ? "red" : textColor, borderColor: error ? "red" : border, paddingVertical: 12 }]}>{formatDateLong(value)}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
      </Pressable>
    </View>
  )
}