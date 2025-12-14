import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, NotificationPreferences } from '../types';

const STORAGE_KEYS = {
  ARTICLES: '@techtest/articles',
  FAVORITES: '@techtest/favorites',
  DELETED: '@techtest/deleted',
  NOTIFICATION_PREFS: '@techtest/notification_prefs',
  LAST_ARTICLE_ID: '@techtest/last_article_id',
  HAS_REQUESTED_PERMISSION: '@techtest/has_requested_permission',
};

// Articles
export const saveArticles = async (articles: Article[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  } catch (error) {
    console.error('Error saving articles:', error);
    throw error;
  }
};

export const getArticles = async (): Promise<Article[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ARTICLES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting articles:', error);
    return [];
  }
};

// Favorites
export const saveFavorites = async (favorites: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
    throw error;
  }
};

export const getFavorites = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

// Deleted articles
export const saveDeleted = async (deleted: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DELETED, JSON.stringify(deleted));
  } catch (error) {
    console.error('Error saving deleted:', error);
    throw error;
  }
};

export const getDeleted = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DELETED);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting deleted:', error);
    return [];
  }
};

// Notification preferences
export const saveNotificationPreferences = async (
  prefs: NotificationPreferences
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    throw error;
  }
};

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);
    if (data) {
      return JSON.parse(data);
    }
    return {
      enabled: true,
      androidArticles: true,
      iosArticles: true,
      reactNativeArticles: true,
      flutterArticles: false,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return {
      enabled: true,
      androidArticles: true,
      iosArticles: true,
      reactNativeArticles: true,
      flutterArticles: false,
    };
  }
};

// Last article ID for notification checking
export const saveLastArticleId = async (id: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_ARTICLE_ID, id);
  } catch (error) {
    console.error('Error saving last article ID:', error);
    throw error;
  }
};

export const getLastArticleId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_ARTICLE_ID);
  } catch (error) {
    console.error('Error getting last article ID:', error);
    return null;
  }
};

// Permission request tracking
export const setHasRequestedPermission = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_REQUESTED_PERMISSION, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting permission request status:', error);
    throw error;
  }
};

export const getHasRequestedPermission = async (): Promise<boolean> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HAS_REQUESTED_PERMISSION);
    return data ? JSON.parse(data) : false;
  } catch (error) {
    console.error('Error getting permission request status:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

