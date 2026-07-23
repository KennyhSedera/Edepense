import { DAILY_KEY, SCHEDULE_LOCK_KEY } from '@/constants/storage';
import { hasExpenseToday, setLastDepenseDate } from '@/controller/depense.controller';
import { addNotification } from '@/controller/notification.app.controller';
import { getUserId } from '@/controller/user.controller';
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

const dailyKey = (userId: string) => `${DAILY_KEY}_${userId}`;
const lockKey = (userId: string) => `${SCHEDULE_LOCK_KEY}_${userId}`;

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(userId: string, hour = 20, minute = 0) {
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const already = await hasExpenseToday(userId);
  if (already) return null;

  const lock = `${hour}:${minute}`;
  const previous = await AsyncStorage.getItem(lockKey(userId));
  if (previous === lock) return null;

  await cancelDailyReminder(userId);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💰 Rappel de dépenses",
      body: "N'oubliez pas de saisir vos dépenses du jour !",
      sound: true,
      data: {
        pathname: "/(form)/shopping-form",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  const notif = await addNotification(userId, {
    type: "info",
    title: "💰 Rappel de dépenses",
    message: "N'oubliez pas de saisir vos dépenses du jour !",
    data: { pathName: "/(form)/shopping-form" },
  });

  if (notif.data?.id) {
    await sendNotification({
      title: "💰 Rappel de dépenses",
      body: "N'oubliez pas de saisir vos dépenses du jour !",
      route: "/(form)/shopping-form",
      params: { id: notif.data?.id },
    });
  }

  await AsyncStorage.multiSet([
    [dailyKey(userId), id],
    [lockKey(userId), lock],
  ]);

  return id;
}

export async function cancelDailyReminder(userId: string) {
  const id = await AsyncStorage.getItem(dailyKey(userId));

  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
  await AsyncStorage.removeItem(dailyKey(userId));
  await AsyncStorage.removeItem(lockKey(userId));
}

export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export async function sendNotification({ params, route, title, body }: SendNotifProps) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        pathname: route ?? "/",
        params: params ?? {},
      },
    },
    trigger: { seconds: 3, repeats: false } as any,
  });
}

export async function onExpenseAdded() {
  const Uid = await getUserId();
  await setLastDepenseDate(Uid as string, new Date().toISOString());
}