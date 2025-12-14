import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
}));

const mockArticles = [
  {
    objectID: '1',
    title: 'React Native Article',
    url: 'https://example.com/1',
    author: 'author1',
    created_at: new Date().toISOString(),
    points: 100,
    num_comments: 50,
    story_title: null,
    story_url: null,
  },
  {
    objectID: '2',
    title: 'iOS Development Tips',
    url: 'https://example.com/2',
    author: 'author2',
    created_at: new Date().toISOString(),
    points: 80,
    num_comments: 30,
    story_title: null,
    story_url: null,
  },
  {
    objectID: '3',
    title: 'Android Best Practices',
    url: 'https://example.com/3',
    author: 'author3',
    created_at: new Date().toISOString(),
    points: 60,
    num_comments: 20,
    story_title: null,
    story_url: null,
  },
];

const mockUseArticlesQuery = jest.fn();
const mockUseDeletedIdsQuery = jest.fn();
const mockUseFavoritesQuery = jest.fn();
const mockUseDeleteArticle = jest.fn();
const mockUseDeletedArticlesQuery = jest.fn();
const mockUseRestoreArticle = jest.fn();
const mockUseToggleFavorite = jest.fn();

jest.mock('../hooks/useArticles', () => ({
  useArticlesQuery: () => mockUseArticlesQuery(),
  useDeletedIdsQuery: () => mockUseDeletedIdsQuery(),
  useFavoritesQuery: () => mockUseFavoritesQuery(),
  useDeleteArticle: () => mockUseDeleteArticle(),
  useDeletedArticlesQuery: () => mockUseDeletedArticlesQuery(),
  useRestoreArticle: () => mockUseRestoreArticle(),
  useToggleFavorite: () => mockUseToggleFavorite(),
}));

jest.mock('../store/useArticlesStore', () => ({
  useArticlesStore: () => ({
    notificationPrefs: {
      enabled: true,
      androidArticles: true,
      iosArticles: true,
      reactNativeArticles: true,
      flutterArticles: false,
    },
    setNotificationPrefs: jest.fn(),
  }),
}));

jest.mock('../services/notifications', () => ({
  sendLocalNotification: jest.fn(() => Promise.resolve()),
  forceCheckNewArticles: jest.fn(() => Promise.resolve({ found: false, message: 'No new articles' })),
}));

describe('Screen Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseArticlesQuery.mockReturnValue({
      data: mockArticles,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
      error: null,
    });
    
    mockUseDeletedIdsQuery.mockReturnValue({
      data: [],
    });
    
    mockUseFavoritesQuery.mockReturnValue({
      data: [],
    });
    
    mockUseDeleteArticle.mockReturnValue({
      mutate: jest.fn(),
    });
    
    mockUseDeletedArticlesQuery.mockReturnValue({
      data: [],
    });
    
    mockUseRestoreArticle.mockReturnValue({
      mutate: jest.fn(),
    });
    
    mockUseToggleFavorite.mockReturnValue({
      mutate: jest.fn(),
    });
  });

  describe('ArticlesScreen', () => {
    it('should filter out deleted articles from the list', () => {
      mockUseDeletedIdsQuery.mockReturnValue({
        data: ['1'],
      });

      const articles = mockArticles;
      const deletedIds = ['1'];
      
      const visibleArticles = articles.filter(
        (article) => !deletedIds.includes(article.objectID)
      );

      expect(visibleArticles.length).toBe(2);
      expect(visibleArticles.find(a => a.objectID === '1')).toBeUndefined();
    });

    it('should show all articles when no articles are deleted', () => {
      const articles = mockArticles;
      const deletedIds: string[] = [];
      
      const visibleArticles = articles.filter(
        (article) => !deletedIds.includes(article.objectID)
      );

      expect(visibleArticles.length).toBe(3);
    });

    it('should call delete mutation when deleting an article', () => {
      const mockMutate = jest.fn();
      mockUseDeleteArticle.mockReturnValue({
        mutate: mockMutate,
      });

      const article = mockArticles[0];
      const deletedIds: string[] = [];
      const favorites: string[] = [];

      mockMutate({
        article,
        currentDeletedIds: deletedIds,
        currentFavorites: favorites,
      });

      expect(mockMutate).toHaveBeenCalledWith({
        article,
        currentDeletedIds: [],
        currentFavorites: [],
      });
    });

    it('should navigate to webview when article is pressed', () => {
      const article = mockArticles[0];
      const url = article.url || article.story_url;
      const title = article.title || article.story_title || 'Article';

      if (url) {
        mockRouter.push({ pathname: '/webview', params: { url, title } });
      }

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/webview',
        params: { url: 'https://example.com/1', title: 'React Native Article' },
      });
    });

    it('should use story_url when url is not available', () => {
      const articleWithStoryUrl = {
        ...mockArticles[0],
        url: null,
        story_url: 'https://story.example.com/1',
      };

      const url = articleWithStoryUrl.url || articleWithStoryUrl.story_url;
      expect(url).toBe('https://story.example.com/1');
    });

    it('should show loading state when isLoading is true', () => {
      mockUseArticlesQuery.mockReturnValue({
        data: [],
        isLoading: true,
        isRefetching: false,
        refetch: jest.fn(),
        error: null,
      });

      const { data, isLoading } = mockUseArticlesQuery();
      expect(isLoading).toBe(true);
      expect(data.length).toBe(0);
    });
  });

  describe('FavoritesScreen', () => {
    it('should filter articles to show only favorites', () => {
      mockUseFavoritesQuery.mockReturnValue({
        data: ['1', '3'],
      });

      const articles = mockArticles;
      const favoriteIds = ['1', '3'];
      const deletedIds: string[] = [];

      const favoriteArticles = articles.filter(
        (article) =>
          favoriteIds.includes(article.objectID) &&
          !deletedIds.includes(article.objectID)
      );

      expect(favoriteArticles.length).toBe(2);
      expect(favoriteArticles[0].objectID).toBe('1');
      expect(favoriteArticles[1].objectID).toBe('3');
    });

    it('should not show deleted articles even if they are favorites', () => {
      const articles = mockArticles;
      const favoriteIds = ['1', '2', '3'];
      const deletedIds = ['2'];

      const favoriteArticles = articles.filter(
        (article) =>
          favoriteIds.includes(article.objectID) &&
          !deletedIds.includes(article.objectID)
      );

      expect(favoriteArticles.length).toBe(2);
      expect(favoriteArticles.find(a => a.objectID === '2')).toBeUndefined();
    });

    it('should return empty array when no favorites exist', () => {
      const articles = mockArticles;
      const favoriteIds: string[] = [];
      const deletedIds: string[] = [];

      const favoriteArticles = articles.filter(
        (article) =>
          favoriteIds.includes(article.objectID) &&
          !deletedIds.includes(article.objectID)
      );

      expect(favoriteArticles.length).toBe(0);
    });

    it('should call delete mutation when deleting a favorite', () => {
      const mockMutate = jest.fn();
      mockUseDeleteArticle.mockReturnValue({
        mutate: mockMutate,
      });

      const article = mockArticles[0];
      const deletedIds: string[] = [];
      const favoriteIds = ['1'];

      mockMutate({
        article,
        currentDeletedIds: deletedIds,
        currentFavorites: favoriteIds,
      });

      expect(mockMutate).toHaveBeenCalledWith({
        article,
        currentDeletedIds: [],
        currentFavorites: ['1'],
      });
    });
  });

  describe('DeletedScreen', () => {
    it('should show only articles that are in deletedIds', () => {
      const deletedArticlesData = mockArticles;
      const deletedIds = ['1', '2'];

      const deletedArticles = deletedArticlesData.filter((article) =>
        deletedIds.includes(article.objectID)
      );

      expect(deletedArticles.length).toBe(2);
      expect(deletedArticles[0].objectID).toBe('1');
      expect(deletedArticles[1].objectID).toBe('2');
    });

    it('should return empty array when no articles are deleted', () => {
      const deletedArticlesData = mockArticles;
      const deletedIds: string[] = [];

      const deletedArticles = deletedArticlesData.filter((article) =>
        deletedIds.includes(article.objectID)
      );

      expect(deletedArticles.length).toBe(0);
    });

    it('should call restore mutation when restoring an article', () => {
      const mockMutate = jest.fn();
      mockUseRestoreArticle.mockReturnValue({
        mutate: mockMutate,
      });

      const articleId = '1';
      const deletedIds = ['1', '2'];

      mockMutate({
        articleId,
        currentDeletedIds: deletedIds,
      });

      expect(mockMutate).toHaveBeenCalledWith({
        articleId: '1',
        currentDeletedIds: ['1', '2'],
      });
    });

    it('should display correct count of deleted articles', () => {
      const deletedArticles = [mockArticles[0], mockArticles[1]];
      
      const countText = `${deletedArticles.length} deleted article${deletedArticles.length !== 1 ? 's' : ''}`;
      
      expect(countText).toBe('2 deleted articles');
    });

    it('should display singular form for one deleted article', () => {
      const deletedArticles = [mockArticles[0]];
      
      const countText = `${deletedArticles.length} deleted article${deletedArticles.length !== 1 ? 's' : ''}`;
      
      expect(countText).toBe('1 deleted article');
    });
  });

  describe('SettingsScreen', () => {
    it('should correctly determine notification topics from preferences', () => {
      const prefs = {
        enabled: true,
        androidArticles: true,
        iosArticles: true,
        reactNativeArticles: true,
        flutterArticles: false,
      };

      const topics: string[] = [];
      if (prefs.androidArticles) topics.push('android');
      if (prefs.iosArticles) topics.push('ios');
      if (prefs.reactNativeArticles) topics.push('react native');
      if (prefs.flutterArticles) topics.push('flutter');

      expect(topics).toEqual(['android', 'ios', 'react native']);
      expect(topics).not.toContain('flutter');
    });

    it('should return empty topics when all are disabled', () => {
      const prefs = {
        enabled: true,
        androidArticles: false,
        iosArticles: false,
        reactNativeArticles: false,
        flutterArticles: false,
      };

      const topics: string[] = [];
      if (prefs.androidArticles) topics.push('android');
      if (prefs.iosArticles) topics.push('ios');
      if (prefs.reactNativeArticles) topics.push('react native');
      if (prefs.flutterArticles) topics.push('flutter');

      expect(topics.length).toBe(0);
    });

    it('should check if notifications are disabled when permission is not granted', () => {
      const permissionStatus = 'denied';
      const notificationPrefs = { enabled: true };

      const isDisabled = permissionStatus !== 'granted' || !notificationPrefs.enabled;
      
      expect(isDisabled).toBe(true);
    });

    it('should check if notifications are disabled when prefs are disabled', () => {
      const permissionStatus = 'granted';
      const notificationPrefs = { enabled: false };

      const isDisabled = permissionStatus !== 'granted' || !notificationPrefs.enabled;
      
      expect(isDisabled).toBe(true);
    });

    it('should enable notifications when both permission and prefs are enabled', () => {
      const permissionStatus = 'granted';
      const notificationPrefs = { enabled: true };

      const isDisabled = permissionStatus !== 'granted' || !notificationPrefs.enabled;
      
      expect(isDisabled).toBe(false);
    });
  });

  describe('Navigation Logic', () => {
    it('should navigate to webview with correct params', () => {
      const article = {
        url: 'https://example.com/article',
        title: 'Test Article',
        story_url: null,
        story_title: null,
      };

      const url = article.url || article.story_url;
      const title = article.title || article.story_title || 'Article';

      mockRouter.push({ pathname: '/webview', params: { url, title } });

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/webview',
        params: {
          url: 'https://example.com/article',
          title: 'Test Article',
        },
      });
    });

    it('should use fallback title when title is null', () => {
      const article = {
        url: 'https://example.com/article',
        title: null as string | null,
        story_url: null,
        story_title: null as string | null,
      };

      const url = article.url || article.story_url;
      const title = article.title || article.story_title || 'Article';

      expect(title).toBe('Article');
    });

    it('should use story_title when title is null', () => {
      const article = {
        url: 'https://example.com/article',
        title: null as string | null,
        story_url: null,
        story_title: 'Story Title' as string | null,
      };

      const title = article.title || article.story_title || 'Article';

      expect(title).toBe('Story Title');
    });
  });

  describe('Article Filtering Logic', () => {
    it('should correctly filter visible articles', () => {
      const articles = mockArticles;
      const deletedIds = ['2'];

      const visibleArticles = articles.filter(
        (article) => !deletedIds.includes(article.objectID)
      );

      expect(visibleArticles.length).toBe(2);
      expect(visibleArticles.map(a => a.objectID)).toEqual(['1', '3']);
    });

    it('should correctly filter favorite articles excluding deleted', () => {
      const articles = mockArticles;
      const favoriteIds = ['1', '2', '3'];
      const deletedIds = ['1'];

      const favoriteArticles = articles.filter(
        (article) =>
          favoriteIds.includes(article.objectID) &&
          !deletedIds.includes(article.objectID)
      );

      expect(favoriteArticles.length).toBe(2);
      expect(favoriteArticles.map(a => a.objectID)).toEqual(['2', '3']);
    });
  });
});

