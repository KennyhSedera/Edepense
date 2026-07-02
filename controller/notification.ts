import { ENABLE_KEY, STORAGE_HOUR_NOTIFICATION_KEY } from "@/constants/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getHourNotification() {
  const hour = await AsyncStorage.getItem(STORAGE_HOUR_NOTIFICATION_KEY);
  return hour ? parseInt(hour) : 16;
}

async function setHourNotification(hour: number) {
  await AsyncStorage.setItem(STORAGE_HOUR_NOTIFICATION_KEY, hour.toString());
}

export async function getNotificationEnabled() {
  const value = await AsyncStorage.getItem(ENABLE_KEY);
  return value === "true";
}

export async function setNotificationEnabled(enabled: boolean) {
  await AsyncStorage.setItem(
    ENABLE_KEY,
    enabled.toString()
  );
}

export { getHourNotification, setHourNotification };