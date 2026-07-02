import { getHourNotification, getNotificationEnabled, setHourNotification, setNotificationEnabled } from "@/controller/notification";
import { cancelDailyReminder, scheduleDailyReminder } from "@/services/notificationService";
import { useEffect, useState } from "react";

export function useHours(params?: number) {
  const [hour, setHour] = useState<number>(params || 16);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {

    async function load() {

      const hour = await getHourNotification();

      const notifEnabled =
        await getNotificationEnabled();

      setHour(hour);
      setEnabled(notifEnabled);

    }

    load();

  }, []);

  const disableNotifications = async () => {

    await setNotificationEnabled(false);

    await cancelDailyReminder();

    setEnabled(false);

  };

  const enableNotifications = async () => {

    await setNotificationEnabled(true);

    await scheduleDailyReminder(
      hour,
      0
    );

    setEnabled(true);

  };

  const handleHourChange = async (newHour: number) => {
    await setHourNotification(newHour);
    await scheduleDailyReminder(newHour, 0);
    setHour(newHour);
  };

  return {
    hour,
    enabled,
    handleHourChange,
    disableNotifications,
    enableNotifications
  };
}