import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { fetchArticles } from './api';
import * as storage from './storage';
import { NotificationPreferences } from '../types';

const BACKGROUND_FETCH_TASK = 'background-fetch-articles';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

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
    trigger: null,
  });
};

const getNotificationTopics = (prefs: NotificationPreferences): string[] => {
  const topics: string[] = [];
  if (prefs.androidArticles) topics.push('android');
  if (prefs.iosArticles) topics.push('ios');
  if (prefs.reactNativeArticles) topics.push('react native');
  if (prefs.flutterArticles) topics.push('flutter');
  return topics;
};

export const checkForNewArticles = async (): Promise<void> => {
  try {
    const [prefs, lastArticleId] = await Promise.all([
      storage.getNotificationPreferences(),
      storage.getLastArticleId(),
    ]);

    if (!prefs.enabled) {
      return;
    }

    const topics = getNotificationTopics(prefs);
    if (topics.length === 0) {
      return;
    }

    const articles = await fetchArticles('mobile');
    
    if (articles.length === 0) {
      return;
    }

    const latestArticle = articles[0];
    
    if (lastArticleId && latestArticle.objectID !== lastArticleId) {
      const lastIndex = articles.findIndex((a) => a.objectID === lastArticleId);
      const newArticles = lastIndex === -1 ? articles : articles.slice(0, lastIndex);
      
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

    await storage.saveLastArticleId(latestArticle.objectID);
  } catch (error) {
    console.error('Error checking for new articles:', error);
  }
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await checkForNewArticles();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundFetch = async (): Promise<void> => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    
    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.log('Background fetch is restricted or denied');
      return;
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    console.log('Background fetch registered successfully');
  } catch (error) {
    console.error('Failed to register background fetch:', error);
  }
};

export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription => {
  return Notifications.addNotificationReceivedListener(callback);
};
