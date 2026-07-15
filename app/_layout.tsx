import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  AppThemeProvider,
  useAppTheme,
} from '@/contexts/themeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { StatusBar } from 'react-native';
import { useEffect } from 'react';
import * as Notifications from "expo-notifications";
import { scheduleDailyReminder } from '@/services/notificationService';
import { getHourNotification, getNotificationEnabled } from '@/controller/notification.controller';
import { initDB } from '@/sqlite/init';
import { NotificationProvider } from '@/contexts/NotificationContext';

function Navigation() {
  const { navigationTheme } = useAppTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;

    async function init() {
      const enabled = await getNotificationEnabled(user!.id);
      const hour = await getHourNotification(user!.id);
      if (enabled) {
        await scheduleDailyReminder(user!.id, hour, 0);
      }
    }
    init();
  }, [user?.id, authLoading]);

  useEffect(() => {
    const listener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      const pathname = data?.pathname;
      const params = data?.params;

      if (!pathname) return;

      requestAnimationFrame(() => {
        router.push({ pathname, params });
      });
    });

    return () => listener.remove();
  }, []);

  useEffect(() => {
    initDB();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)" && segments[1] !== "start";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

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
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/start" options={{ headerShown: false }} />
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
      <AuthProvider>
        <NotificationProvider>
          <Navigation />
        </NotificationProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}