import { useArticlesStore } from '../store/useArticlesStore';
import * as api from '../services/api';
import * as storage from '../services/storage';

jest.mock('../services/api');
jest.mock('../services/storage');

describe('useArticlesStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useArticlesStore.setState({
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
    });
  });

  const mockArticles = [
    {
      objectID: '1',
      title: 'Test Article 1',
      url: 'https://example.com/1',
      author: 'user1',
      created_at: '2024-01-02T00:00:00.000Z',
      points: 100,
      num_comments: 50,
    },
    {
      objectID: '2',
      title: 'Test Article 2',
      url: 'https://example.com/2',
      author: 'user2',
      created_at: '2024-01-01T00:00:00.000Z',
      points: 75,
      num_comments: 30,
    },
  ];

  describe('initialize', () => {
    it('should load cached data on initialization', async () => {
      (storage.getArticles as jest.Mock).mockResolvedValue(mockArticles);
      (storage.getFavorites as jest.Mock).mockResolvedValue(['1']);
      (storage.getDeleted as jest.Mock).mockResolvedValue(['3']);
      (storage.getNotificationPreferences as jest.Mock).mockResolvedValue({
        enabled: true,
        androidArticles: true,
        iosArticles: false,
        reactNativeArticles: true,
        flutterArticles: false,
      });
      (api.fetchArticles as jest.Mock).mockResolvedValue(mockArticles);
      (storage.saveArticles as jest.Mock).mockResolvedValue(undefined);
      (storage.saveLastArticleId as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().initialize();

      const state = useArticlesStore.getState();
      expect(state.articles).toEqual(mockArticles);
      expect(state.favoriteIds).toEqual(['1']);
      expect(state.deletedIds).toEqual(['3']);
      expect(state.isInitialized).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('should add article to favorites', async () => {
      useArticlesStore.setState({ favoriteIds: [] });
      (storage.saveFavorites as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().toggleFavorite('1');

      expect(useArticlesStore.getState().favoriteIds).toContain('1');
      expect(storage.saveFavorites).toHaveBeenCalledWith(['1']);
    });

    it('should remove article from favorites', async () => {
      useArticlesStore.setState({ favoriteIds: ['1', '2'] });
      (storage.saveFavorites as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().toggleFavorite('1');

      expect(useArticlesStore.getState().favoriteIds).not.toContain('1');
      expect(useArticlesStore.getState().favoriteIds).toContain('2');
    });
  });

  describe('deleteArticle', () => {
    it('should remove article from list and add to deleted', async () => {
      useArticlesStore.setState({ 
        articles: mockArticles, 
        deletedIds: [], 
        favoriteIds: ['1'] 
      });
      (storage.getDeletedArticles as jest.Mock).mockResolvedValue([]);
      (storage.saveDeletedArticles as jest.Mock).mockResolvedValue(undefined);
      (storage.saveArticles as jest.Mock).mockResolvedValue(undefined);
      (storage.saveDeleted as jest.Mock).mockResolvedValue(undefined);
      (storage.saveFavorites as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().deleteArticle('1');

      const state = useArticlesStore.getState();
      expect(state.articles.find(a => a.objectID === '1')).toBeUndefined();
      expect(state.deletedIds).toContain('1');
      expect(state.favoriteIds).not.toContain('1');
    });
  });

  describe('restoreArticle', () => {
    it('should remove article from deleted and add back to list', async () => {
      useArticlesStore.setState({ 
        articles: [mockArticles[1]], 
        deletedIds: ['1'] 
      });
      (storage.getDeletedArticles as jest.Mock).mockResolvedValue(mockArticles);
      (storage.saveDeletedArticles as jest.Mock).mockResolvedValue(undefined);
      (storage.saveDeleted as jest.Mock).mockResolvedValue(undefined);
      (storage.saveArticles as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().restoreArticle('1');

      const state = useArticlesStore.getState();
      expect(state.deletedIds).not.toContain('1');
      expect(state.articles.find(a => a.objectID === '1')).toBeDefined();
    });
  });

  describe('setNotificationPrefs', () => {
    it('should update notification preferences', async () => {
      (storage.saveNotificationPreferences as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().setNotificationPrefs({ androidArticles: false });

      const state = useArticlesStore.getState();
      expect(state.notificationPrefs.androidArticles).toBe(false);
      expect(state.notificationPrefs.iosArticles).toBe(true);
    });
  });

  describe('loadArticles', () => {
    it('should fetch and filter articles', async () => {
      useArticlesStore.setState({ deletedIds: ['2'] });
      (api.fetchArticles as jest.Mock).mockResolvedValue(mockArticles);
      (storage.saveArticles as jest.Mock).mockResolvedValue(undefined);
      (storage.saveLastArticleId as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().loadArticles();

      const state = useArticlesStore.getState();
      expect(state.articles.find(a => a.objectID === '2')).toBeUndefined();
      expect(state.articles.find(a => a.objectID === '1')).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      (api.fetchArticles as jest.Mock).mockRejectedValue(new Error('Network error'));

      await useArticlesStore.getState().loadArticles();

      const state = useArticlesStore.getState();
      expect(state.error).toBe('Failed to load articles. Showing cached data.');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useArticlesStore.setState({ error: 'Some error' });

      useArticlesStore.getState().clearError();

      expect(useArticlesStore.getState().error).toBeNull();
    });
  });
});
