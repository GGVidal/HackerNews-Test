import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveArticles,
  getArticles,
  saveFavorites,
  getFavorites,
  saveDeleted,
  getDeleted,
  saveNotificationPreferences,
  getNotificationPreferences,
  saveLastArticleId,
  getLastArticleId,
  setHasRequestedPermission,
  getHasRequestedPermission,
  clearAllData,
} from '../services/storage';
import { Article, NotificationPreferences } from '../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Articles', () => {
    const mockArticles: Article[] = [
      {
        objectID: '1',
        title: 'Test Article 1',
        url: 'https://example.com/1',
        author: 'user1',
        created_at: '2024-01-01T00:00:00.000Z',
        points: 100,
        num_comments: 50,
      },
      {
        objectID: '2',
        title: 'Test Article 2',
        url: 'https://example.com/2',
        author: 'user2',
        created_at: '2024-01-02T00:00:00.000Z',
        points: 75,
        num_comments: 30,
      },
    ];

    it('should save articles', async () => {
      await saveArticles(mockArticles);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@techtest/articles',
        JSON.stringify(mockArticles)
      );
    });

    it('should get articles', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockArticles)
      );

      const result = await getArticles();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@techtest/articles');
      expect(result).toEqual(mockArticles);
    });

    it('should return empty array when no articles stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getArticles();

      expect(result).toEqual([]);
    });
  });

  describe('Favorites', () => {
    const mockFavorites = ['1', '2', '3'];

    it('should save favorites', async () => {
      await saveFavorites(mockFavorites);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@techtest/favorites',
        JSON.stringify(mockFavorites)
      );
    });

    it('should get favorites', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockFavorites)
      );

      const result = await getFavorites();

      expect(result).toEqual(mockFavorites);
    });

    it('should return empty array when no favorites stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getFavorites();

      expect(result).toEqual([]);
    });
  });

  describe('Deleted', () => {
    const mockDeleted = ['4', '5'];

    it('should save deleted IDs', async () => {
      await saveDeleted(mockDeleted);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@techtest/deleted',
        JSON.stringify(mockDeleted)
      );
    });

    it('should get deleted IDs', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockDeleted)
      );

      const result = await getDeleted();

      expect(result).toEqual(mockDeleted);
    });
  });

  describe('Notification Preferences', () => {
    const mockPrefs: NotificationPreferences = {
      enabled: true,
      androidArticles: true,
      iosArticles: false,
      reactNativeArticles: true,
      flutterArticles: false,
    };

    it('should save notification preferences', async () => {
      await saveNotificationPreferences(mockPrefs);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@techtest/notification_prefs',
        JSON.stringify(mockPrefs)
      );
    });

    it('should get notification preferences', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(mockPrefs)
      );

      const result = await getNotificationPreferences();

      expect(result).toEqual(mockPrefs);
    });

    it('should return default preferences when none stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getNotificationPreferences();

      expect(result).toEqual({
        enabled: true,
        androidArticles: true,
        iosArticles: true,
        reactNativeArticles: true,
        flutterArticles: false,
      });
    });
  });

  describe('Last Article ID', () => {
    it('should save last article ID', async () => {
      await saveLastArticleId('abc123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@techtest/last_article_id',
        'abc123'
      );
    });

    it('should get last article ID', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('abc123');

      const result = await getLastArticleId();

      expect(result).toBe('abc123');
    });
  });

  describe('Permission Request Status', () => {
    it('should save permission request status', async () => {
      await setHasRequestedPermission(true);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@techtest/has_requested_permission',
        'true'
      );
    });

    it('should get permission request status', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

      const result = await getHasRequestedPermission();

      expect(result).toBe(true);
    });

    it('should return false when not set', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await getHasRequestedPermission();

      expect(result).toBe(false);
    });
  });

  describe('Clear All Data', () => {
    it('should clear all storage keys', async () => {
      await clearAllData();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@techtest/articles',
        '@techtest/favorites',
        '@techtest/deleted',
        '@techtest/notification_prefs',
        '@techtest/last_article_id',
        '@techtest/has_requested_permission',
      ]);
    });
  });
});

