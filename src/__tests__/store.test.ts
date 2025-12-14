import { useArticlesStore } from '../store/useArticlesStore';
import * as storage from '../services/storage';

jest.mock('../services/storage');

describe('useArticlesStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useArticlesStore.setState({
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

  describe('initialize', () => {
    it('should load notification preferences on initialization', async () => {
      (storage.getNotificationPreferences as jest.Mock).mockResolvedValue({
        enabled: true,
        androidArticles: true,
        iosArticles: false,
        reactNativeArticles: true,
        flutterArticles: false,
      });

      await useArticlesStore.getState().initialize();

      const state = useArticlesStore.getState();
      expect(state.notificationPrefs.iosArticles).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      (storage.getNotificationPreferences as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await useArticlesStore.getState().initialize();

      const state = useArticlesStore.getState();
      expect(state.isInitialized).toBe(true);
    });
  });

  describe('setNotificationPrefs', () => {
    it('should update notification preferences', async () => {
      (storage.saveNotificationPreferences as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().setNotificationPrefs({ androidArticles: false });

      const state = useArticlesStore.getState();
      expect(state.notificationPrefs.androidArticles).toBe(false);
      expect(state.notificationPrefs.iosArticles).toBe(true);
      expect(storage.saveNotificationPreferences).toHaveBeenCalled();
    });

    it('should merge with existing preferences', async () => {
      (storage.saveNotificationPreferences as jest.Mock).mockResolvedValue(undefined);

      await useArticlesStore.getState().setNotificationPrefs({ flutterArticles: true });

      const state = useArticlesStore.getState();
      expect(state.notificationPrefs.flutterArticles).toBe(true);
      expect(state.notificationPrefs.androidArticles).toBe(true);
    });
  });
});
