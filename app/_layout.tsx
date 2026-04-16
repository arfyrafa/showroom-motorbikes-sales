import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/lib/auth-context';

// Component yang handle auth-aware routing
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isSignedIn, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'index';

    if (!isSignedIn) {
      // ALWAYS go to login if not signed in, regardless of current screen
      if (segments[0] !== 'login' && segments[0] !== 'register' && segments[0] !== 'index') {
        router.replace('/login');
      }
    } else if (isSignedIn && inAuthGroup) {
      // Go to tabs if signed in but on auth screen
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoading, segments, router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="motorcycle-detail" options={{ headerShown: false }} />
        <Stack.Screen name="settings-profile" options={{ headerShown: false }} />
        <Stack.Screen name="settings-preferences" options={{ headerShown: false }} />
        <Stack.Screen name="settings-account" options={{ headerShown: false }} />
        <Stack.Screen name="settings-change-password" options={{ headerShown: false }} />
        <Stack.Screen name="admin-motorcycle" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}