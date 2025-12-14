import { fetchArticles, fetchArticlesByTopics } from '../services/api';

global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchArticles', () => {
    it('should fetch articles from Hacker News API', async () => {
      const mockArticles = [
        {
          objectID: '1',
          title: 'Test Article',
          url: 'https://example.com',
          author: 'testuser',
          created_at: '2024-01-01T00:00:00.000Z',
          points: 100,
          num_comments: 50,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hits: mockArticles }),
      });

      const result = await fetchArticles('mobile');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hn.algolia.com/api/v1/search_by_date?query=mobile'
      );
      expect(result).toEqual(mockArticles);
    });

    it('should filter out articles without titles or urls', async () => {
      const mockArticles = [
        {
          objectID: '1',
          title: 'Valid Article',
          url: 'https://example.com',
          author: 'user1',
          created_at: '2024-01-01T00:00:00.000Z',
          points: 100,
          num_comments: 50,
        },
        {
          objectID: '2',
          title: null,
          url: null,
          author: 'user2',
          created_at: '2024-01-01T00:00:00.000Z',
          points: 50,
          num_comments: 25,
        },
        {
          objectID: '3',
          title: null,
          story_title: 'Story Title',
          url: null,
          story_url: 'https://example2.com',
          author: 'user3',
          created_at: '2024-01-01T00:00:00.000Z',
          points: 75,
          num_comments: 30,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ hits: mockArticles }),
      });

      const result = await fetchArticles();

      expect(result).toHaveLength(2);
      expect(result[0].objectID).toBe('1');
      expect(result[1].objectID).toBe('3');
    });

    it('should throw error on HTTP failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchArticles()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should throw error on network failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchArticles()).rejects.toThrow('Network error');
    });
  });

  describe('fetchArticlesByTopics', () => {
    it('should fetch articles for multiple topics and remove duplicates', async () => {
      const mockArticles1 = [
        {
          objectID: '1',
          title: 'Android Article',
          url: 'https://example.com/1',
          author: 'user1',
          created_at: '2024-01-02T00:00:00.000Z',
          points: 100,
          num_comments: 50,
        },
        {
          objectID: '2',
          title: 'Shared Article',
          url: 'https://example.com/2',
          author: 'user2',
          created_at: '2024-01-01T00:00:00.000Z',
          points: 75,
          num_comments: 30,
        },
      ];

      const mockArticles2 = [
        {
          objectID: '2',
          title: 'Shared Article',
          url: 'https://example.com/2',
          author: 'user2',
          created_at: '2024-01-01T00:00:00.000Z',
          points: 75,
          num_comments: 30,
        },
        {
          objectID: '3',
          title: 'iOS Article',
          url: 'https://example.com/3',
          author: 'user3',
          created_at: '2024-01-03T00:00:00.000Z',
          points: 120,
          num_comments: 60,
        },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ hits: mockArticles1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ hits: mockArticles2 }),
        });

      const result = await fetchArticlesByTopics(['android', 'ios']);

      expect(result).toHaveLength(3);
      
      expect(result[0].objectID).toBe('3');
      expect(result[1].objectID).toBe('1');
      expect(result[2].objectID).toBe('2');
    });
  });
});

