import { ENABLE_KEY, STORAGE_HOUR_NOTIFICATION_KEY } from "@/constants/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const hourKey = (userId: string) => `${STORAGE_HOUR_NOTIFICATION_KEY}_${userId}`;
const enableKey = (userId: string) => `${ENABLE_KEY}_${userId}`;

async function getHourNotification(userId: string) {
  const hour = await AsyncStorage.getItem(hourKey(userId));
  return hour ? parseInt(hour) : 16;
}

async function setHourNotification(userId: string, hour: number) {
  await AsyncStorage.setItem(hourKey(userId), hour.toString());
}

export async function getNotificationEnabled(userId: string) {
  const value = await AsyncStorage.getItem(enableKey(userId));
  return value === "true";
}

export async function setNotificationEnabled(userId: string, enabled: boolean) {
  await AsyncStorage.setItem(enableKey(userId), enabled.toString());
}

export { getHourNotification, setHourNotification };