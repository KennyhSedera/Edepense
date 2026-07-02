import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import {
  AppThemeProvider,
  useAppTheme,
} from '@/hooks/themeContext';
import { StatusBar, } from 'react-native';
import { useEffect } from 'react';
import * as Notifications from "expo-notifications";
import { scheduleDailyReminder } from '@/services/notificationService';
import { getHourNotification, getNotificationEnabled } from '@/controller/notification';

function Navigation() {
  const { navigationTheme } = useAppTheme();
  const router = useRouter();

  let listener: Notifications.Subscription | null = null;

  useEffect(() => {
    async function init() {
      const enabled = await getNotificationEnabled();
      const hour = await getHourNotification();
      if (enabled) {
        await scheduleDailyReminder(hour, 0);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (listener) listener.remove();

    listener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        const pathname = data?.pathname;
        const params = data?.params;

        if (!pathname) return;

        requestAnimationFrame(() => {
          router.push({ pathname, params });
        });
      });

    return () => listener?.remove();
  }, []);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar
        backgroundColor={"transparent"}
        barStyle={"light-content"}
        translucent
      />
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(form)" options={{ headerShown: false }} />
        <Stack.Screen name="(detail)" options={{ headerShown: false }} />
        <Stack.Screen name="(guest)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Navigation />
    </AppThemeProvider>
  );
}