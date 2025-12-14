import { create } from 'zustand';
import { Article, NotificationPreferences } from '../types';
import { fetchArticles } from '../services/api';
import * as storage from '../services/storage';

interface ArticlesState {
  articles: Article[];
  favoriteIds: string[];
  deletedIds: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  notificationPrefs: NotificationPreferences;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  loadArticles: () => Promise<void>;
  refreshArticles: () => Promise<void>;
  toggleFavorite: (articleId: string) => Promise<void>;
  deleteArticle: (articleId: string) => Promise<void>;
  restoreArticle: (articleId: string) => Promise<void>;
  permanentlyDeleteArticle: (articleId: string) => Promise<void>;
  setNotificationPrefs: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  clearError: () => void;
}

export const useArticlesStore = create<ArticlesState>((set, get) => ({
  articles: [],
  favoriteIds: [],
  deletedIds: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
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
      set({ isLoading: true });

      const [cachedArticles, favoriteIds, deletedIds, notificationPrefs] =
        await Promise.all([
          storage.getArticles(),
          storage.getFavorites(),
          storage.getDeleted(),
          storage.getNotificationPreferences(),
        ]);

      const visibleArticles = cachedArticles.filter(
        (article) => !deletedIds.includes(article.objectID)
      );

      set({
        articles: visibleArticles,
        favoriteIds,
        deletedIds,
        notificationPrefs,
        isInitialized: true,
      });

      get().loadArticles();
    } catch (error) {
      console.error('Error initializing store:', error);
      set({ error: 'Failed to initialize app', isLoading: false, isInitialized: true });
    }
  },

  loadArticles: async () => {
    try {
      set({ isLoading: true, error: null });

      const articles = await fetchArticles('mobile');
      const deletedIds = get().deletedIds;

      const filteredArticles = articles.filter(
        (article) => !deletedIds.includes(article.objectID)
      );

      const sortedArticles = filteredArticles.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      set({ articles: sortedArticles, isLoading: false });
      await storage.saveArticles(sortedArticles);

      if (sortedArticles.length > 0) {
        await storage.saveLastArticleId(sortedArticles[0].objectID);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      set({ error: 'Failed to load articles. Showing cached data.', isLoading: false });
    }
  },

  refreshArticles: async () => {
    try {
      set({ isRefreshing: true, error: null });

      const articles = await fetchArticles('mobile');
      const deletedIds = get().deletedIds;

      const filteredArticles = articles.filter(
        (article) => !deletedIds.includes(article.objectID)
      );

      const sortedArticles = filteredArticles.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      set({ articles: sortedArticles, isRefreshing: false });
      await storage.saveArticles(sortedArticles);
    } catch (error) {
      console.error('Error refreshing articles:', error);
      set({ error: 'Failed to refresh articles', isRefreshing: false });
    }
  },

  toggleFavorite: async (articleId: string) => {
    const { favoriteIds } = get();
    let newFavorites: string[];

    if (favoriteIds.includes(articleId)) {
      newFavorites = favoriteIds.filter((id) => id !== articleId);
    } else {
      newFavorites = [...favoriteIds, articleId];
    }

    set({ favoriteIds: newFavorites });
    await storage.saveFavorites(newFavorites);
  },

  deleteArticle: async (articleId: string) => {
    const { articles, deletedIds, favoriteIds } = get();

    const articleToDelete = articles.find((a) => a.objectID === articleId);
    const newArticles = articles.filter((article) => article.objectID !== articleId);
    const newDeletedIds = [...deletedIds, articleId];
    const newFavorites = favoriteIds.filter((id) => id !== articleId);

    set({
      articles: newArticles,
      deletedIds: newDeletedIds,
      favoriteIds: newFavorites,
    });

    if (articleToDelete) {
      const existingDeletedArticles = await storage.getDeletedArticles();
      const newDeletedArticles = [
        ...existingDeletedArticles.filter(a => a.objectID !== articleId),
        articleToDelete,
      ];
      await storage.saveDeletedArticles(newDeletedArticles);
    }

    await Promise.all([
      storage.saveArticles(newArticles),
      storage.saveDeleted(newDeletedIds),
      storage.saveFavorites(newFavorites),
    ]);
  },

  restoreArticle: async (articleId: string) => {
    const { deletedIds, articles } = get();
    
    const newDeletedIds = deletedIds.filter((id) => id !== articleId);
    const deletedArticles = await storage.getDeletedArticles();
    const restoredArticle = deletedArticles.find((a) => a.objectID === articleId);
    
    let newArticles = articles;
    if (restoredArticle && !articles.find((a) => a.objectID === articleId)) {
      newArticles = [...articles, restoredArticle].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    const newDeletedArticles = deletedArticles.filter((a) => a.objectID !== articleId);

    set({ deletedIds: newDeletedIds, articles: newArticles });
    await Promise.all([
      storage.saveDeleted(newDeletedIds),
      storage.saveArticles(newArticles),
      storage.saveDeletedArticles(newDeletedArticles),
    ]);
  },

  permanentlyDeleteArticle: async (articleId: string) => {
    const { deletedIds } = get();
    const newDeletedIds = deletedIds.filter((id) => id !== articleId);
    
    set({ deletedIds: newDeletedIds });
    await storage.saveDeleted(newDeletedIds);
  },

  setNotificationPrefs: async (prefs: Partial<NotificationPreferences>) => {
    const { notificationPrefs } = get();
    const newPrefs = { ...notificationPrefs, ...prefs };
    set({ notificationPrefs: newPrefs });
    await storage.saveNotificationPreferences(newPrefs);
  },

  clearError: () => set({ error: null }),
}));
