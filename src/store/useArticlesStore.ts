import { create } from 'zustand';
import { NotificationPreferences } from '../types';
import * as storage from '../services/storage';

interface ArticlesState {
  notificationPrefs: NotificationPreferences;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

export const useArticlesStore = create<ArticlesState>((set, get) => ({
  notificationPrefs: {
    enabled: true,
    androidArticles: true,
    iosArticles: true,
    reactNativeArticles: true,
    flutterArticles: false,
  },
  isInitialized: false,

  initialize: async () => {
    try {
      const notificationPrefs = await storage.getNotificationPreferences();

      set({
        notificationPrefs,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error initializing store:', error);
      set({ isInitialized: true });
    }
  },

  setNotificationPrefs: async (prefs: Partial<NotificationPreferences>) => {
    const { notificationPrefs } = get();
    const newPrefs = { ...notificationPrefs, ...prefs };
    set({ notificationPrefs: newPrefs });
    await storage.saveNotificationPreferences(newPrefs);
  },
}));
