import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';
import { fetchArticles } from './api';
import * as storage from './storage';
import { NotificationPreferences } from '../types';

const BACKGROUND_FETCH_TASK = 'background-fetch-articles';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Check if permissions are granted
export const checkNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

// Schedule a local notification
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Immediate notification
  });
};

// Get notification topics based on preferences
const getNotificationTopics = (prefs: NotificationPreferences): string[] => {
  const topics: string[] = [];
  if (prefs.androidArticles) topics.push('android');
  if (prefs.iosArticles) topics.push('ios');
  if (prefs.reactNativeArticles) topics.push('react native');
  if (prefs.flutterArticles) topics.push('flutter');
  return topics;
};

// Check for new articles and send notification
export const checkForNewArticles = async (): Promise<void> => {
  try {
    const [prefs, lastArticleId] = await Promise.all([
      storage.getNotificationPreferences(),
      storage.getLastArticleId(),
    ]);

    // Don't check if notifications are disabled
    if (!prefs.enabled) {
      return;
    }

    const topics = getNotificationTopics(prefs);
    if (topics.length === 0) {
      return;
    }

    // Fetch latest articles
    const articles = await fetchArticles('mobile');
    
    if (articles.length === 0) {
      return;
    }

    const latestArticle = articles[0];
    
    // If we have a last article ID and it's different from the latest
    if (lastArticleId && latestArticle.objectID !== lastArticleId) {
      // Find new articles
      const lastIndex = articles.findIndex((a) => a.objectID === lastArticleId);
      const newArticles = lastIndex === -1 ? articles : articles.slice(0, lastIndex);
      
      // Filter by user preferences
      const relevantArticles = newArticles.filter((article) => {
        const title = (article.title || article.story_title || '').toLowerCase();
        return topics.some((topic) => title.includes(topic.toLowerCase()));
      });

      if (relevantArticles.length > 0) {
        const firstArticle = relevantArticles[0];
        const articleTitle = firstArticle.title || firstArticle.story_title || 'New article';
        const articleUrl = firstArticle.url || firstArticle.story_url;
        
        const notificationTitle = relevantArticles.length === 1
          ? 'New Mobile Article'
          : `${relevantArticles.length} New Mobile Articles`;
        
        const notificationBody = relevantArticles.length === 1
          ? articleTitle
          : `Check out the latest mobile development articles`;

        await sendLocalNotification(notificationTitle, notificationBody, {
          articleId: firstArticle.objectID,
          url: articleUrl,
          title: articleTitle,
        });
      }
    }

    // Update last article ID
    await storage.saveLastArticleId(latestArticle.objectID);
  } catch (error) {
    console.error('Error checking for new articles:', error);
  }
};

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await checkForNewArticles();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register background fetch
export const registerBackgroundFetch = async (): Promise<void> => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.log('Background fetch is restricted or denied');
      return;
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    console.log('Background fetch registered successfully');
  } catch (error) {
    console.error('Failed to register background fetch:', error);
  }
};

// Unregister background fetch
export const unregisterBackgroundFetch = async (): Promise<void> => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch unregistered');
  } catch (error) {
    console.error('Failed to unregister background fetch:', error);
  }
};

// Handle notification response (when user taps on notification)
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Handle notification received while app is in foreground
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};

