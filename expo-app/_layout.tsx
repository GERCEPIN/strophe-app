import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNotifications } from '../hooks/useNotifications';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const segments = useSegments();

  useNotifications(profile);

  useEffect(() => {
    if (loading) return;

    const inApp = segments[0] === '(app)';
    const inAuth = segments[0] === '(auth)';

    if (!session && !inAuth) {
      router.replace('/(auth)/onboarding');
    } else if (session && !inApp) {
      router.replace('/(app)');
    }
  }, [session, loading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}
