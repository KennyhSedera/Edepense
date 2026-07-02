import { DAILY_KEY, SCHEDULE_LOCK_KEY } from '@/constants/storage';
import { hasExpenseToday, setLastDepenseDate } from '@/controller/depense';
import { SendNotifProps } from '@/types/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(
  hour = 20,
  minute = 0
) {

  const granted =
    await requestNotificationPermission();

  if (!granted) return null;

  const already =
    await hasExpenseToday();

  if (already) {
    return null;
  }

  const lock = `${hour}:${minute}`;

  const previous =
    await AsyncStorage.getItem(SCHEDULE_LOCK_KEY);

  if (previous === lock) return null;

  await cancelDailyReminder();

  const id =
    await Notifications.scheduleNotificationAsync({

      content: {
        title: "💰 Rappel de dépenses",
        body: "N'oubliez pas de saisir vos dépenses du jour !",
        sound: true,
        data: {
          pathname: "/(form)/shopping-form",
        },
      },

      trigger: {
        type:
          Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },

    });

  await AsyncStorage.multiSet([
    [DAILY_KEY, id],
    [SCHEDULE_LOCK_KEY, lock],
  ]);

  return id;
}

export async function cancelDailyReminder() {
  const id = await AsyncStorage.getItem(DAILY_KEY);

  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
  await AsyncStorage.removeItem(DAILY_KEY);
  await AsyncStorage.removeItem(SCHEDULE_LOCK_KEY);

}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export async function sendNotification({ params, route, title, body }: SendNotifProps) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: {
        pathname: route ?? "/",
        params: params ?? {}
      }
    },
    trigger: { seconds: 3, repeats: false } as any,
  });
}

export async function onExpenseAdded() {
  await setLastDepenseDate();
  await cancelDailyReminder();
}
