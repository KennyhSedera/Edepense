import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  AppThemeProvider,
  useAppTheme,
} from '@/contexts/themeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppState, StatusBar, StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Notifications from "expo-notifications";
import { scheduleDailyReminder } from '@/services/notificationService';
import { getHourNotification, getNotificationEnabled } from '@/controller/notification.controller';
import { initDB } from '@/sqlite/init';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useAppLock } from '@/hooks/useAppLock';
import LockScreen from '@/components/lock/LockScreen';
import { LockSuspendProvider, useLockSuspend } from '@/contexts/LockSuspendContext';

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

function AppGate() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isLockEnabled, loading: lockLoading } = useAppLock(user?.id);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const appState = useRef(AppState.currentState);
  const isAuthenticatingRef = useRef(false);
  const graceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isSuspendedRef } = useLockSuspend();
  const { theme } = useAppTheme();

  useEffect(() => {
    if (!lockLoading && !authLoading && isAuthenticated && user?.id && isLockEnabled) {
      setIsAppLocked(true);
    }
  }, [lockLoading, authLoading, isAuthenticated, user?.id, isLockEnabled]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (isAuthenticatingRef.current || isSuspendedRef.current) {
        appState.current = nextState;
        return;
      }

      if (
        appState.current.match(/active/) &&
        nextState === 'background' &&
        isLockEnabled &&
        isAuthenticated &&
        !isAppLocked
      ) {
        setIsAppLocked(true);
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [isLockEnabled, isAuthenticated, isAppLocked, isSuspendedRef]);

  const armGracePeriod = (durationMs: number) => {
    if (graceTimeoutRef.current) clearTimeout(graceTimeoutRef.current);
    isAuthenticatingRef.current = true;
    graceTimeoutRef.current = setTimeout(() => {
      isAuthenticatingRef.current = false;
    }, durationMs);
  };

  const handleUnlock = () => {
    armGracePeriod(1500);
    setIsAppLocked(false);
  };

  const handleAuthenticatingChange = (val: boolean) => {
    if (val) {
      if (graceTimeoutRef.current) clearTimeout(graceTimeoutRef.current);
      isAuthenticatingRef.current = true;
    } else {
      armGracePeriod(1500);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Navigation />

      {isAppLocked && user?.id && (
        <View style={StyleSheet.absoluteFill}>
          <LockScreen
            theme={theme}
            userId={user.id}
            onUnlock={handleUnlock}
            onAuthenticatingChange={handleAuthenticatingChange}
          />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <LockSuspendProvider>
            <AppGate />
          </LockSuspendProvider>
        </NotificationProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
