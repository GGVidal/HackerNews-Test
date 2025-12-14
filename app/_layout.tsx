import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Alert, ActivityIndicator, Text } from 'react-native';
import { QueryProvider } from '../src/providers/QueryProvider';
import { useArticlesStore } from '../src/store/useArticlesStore';
import {
  requestNotificationPermissions,
  registerBackgroundFetch,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '../src/services/notifications';
import * as storage from '../src/services/storage';
import { router } from 'expo-router';

function AppContent() {
  const { initialize, isInitialized } = useArticlesStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await initialize();
        
        const hasRequestedPermission = await storage.getHasRequestedPermission();
        
        if (!hasRequestedPermission) {
          Alert.alert(
            'Stay Updated',
            'Would you like to receive notifications when new articles are published?',
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: async () => {
                  await storage.setHasRequestedPermission(true);
                },
              },
              {
                text: 'Enable',
                onPress: async () => {
                  await requestNotificationPermissions();
                  await storage.setHasRequestedPermission(true);
                  await registerBackgroundFetch();
                },
              },
            ]
          );
        } else {
          await registerBackgroundFetch();
        }

        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true);
      }
    };

    initApp();
  }, [initialize]);

  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      
      if (data?.url) {
        router.push({
          pathname: '/webview',
          params: {
            url: data.url as string,
            title: (data.title as string) || 'Article',
          },
        });
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  if (!isReady || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#888' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="webview" options={{ title: 'Article' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <QueryProvider>
        <AppContent />
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
