import { getHourNotification, getNotificationEnabled, setHourNotification, setNotificationEnabled } from "@/controller/notification.controller";
import { cancelDailyReminder, scheduleDailyReminder } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export function useHours(params?: number) {
  const { user } = useAuth();
  const [hour, setHour] = useState<number>(params || 16);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const hour = await getHourNotification(user!.id);
      const notifEnabled = await getNotificationEnabled(user!.id);

      setHour(hour);
      setEnabled(notifEnabled);
    }

    load();
  }, [user?.id]);

  const disableNotifications = async () => {
    if (!user) return;
    await setNotificationEnabled(user.id, false);
    await cancelDailyReminder(user.id);
    setEnabled(false);
  };

  const enableNotifications = async () => {
    if (!user) return;
    await setNotificationEnabled(user.id, true);
    await scheduleDailyReminder(user.id, hour, 0);
    setEnabled(true);
  };

  const handleHourChange = async (newHour: number) => {
    if (!user) return;
    await setHourNotification(user.id, newHour);
    await scheduleDailyReminder(user.id, newHour, 0);
    setHour(newHour);
  };

  return {
    hour,
    enabled,
    handleHourChange,
    disableNotifications,
    enableNotifications,
  };
}