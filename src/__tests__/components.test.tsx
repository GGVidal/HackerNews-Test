describe('Components - Business Logic', () => {
  describe('ArticleCard logic', () => {
    const mockArticle = {
      objectID: '1',
      title: 'Test Article Title' as string | null,
      url: 'https://example.com',
      author: 'testuser',
      created_at: new Date().toISOString(),
      points: 100,
      num_comments: 50,
      story_title: null as string | null,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should correctly determine if article is favorited', () => {
      const favoriteIds = ['1', '2', '3'];
      expect(favoriteIds.includes(mockArticle.objectID)).toBe(true);
      expect(favoriteIds.includes('999')).toBe(false);
    });

    it('should get title from article.title', () => {
      const title = mockArticle.title || mockArticle.story_title || 'Untitled';
      expect(title).toBe('Test Article Title');
    });

    it('should fall back to story_title when title is null', () => {
      const articleWithStoryTitle = {
        ...mockArticle,
        title: null,
        story_title: 'Story Title Here',
      };
      const title = articleWithStoryTitle.title || articleWithStoryTitle.story_title || 'Untitled';
      expect(title).toBe('Story Title Here');
    });

    it('should fall back to Untitled when both titles are null', () => {
      const articleWithNoTitle = {
        ...mockArticle,
        title: null,
        story_title: null,
      };
      const title = articleWithNoTitle.title || articleWithNoTitle.story_title || 'Untitled';
      expect(title).toBe('Untitled');
    });

    it('should correctly format author', () => {
      expect(mockArticle.author).toBe('testuser');
    });

    it('should handle null author', () => {
      const articleWithNoAuthor = { ...mockArticle, author: '' };
      const author = articleWithNoAuthor.author || 'Unknown';
      expect(author).toBe('Unknown');
    });

    it('should handle null points', () => {
      const articleWithNoPoints = { ...mockArticle, points: null };
      const points = articleWithNoPoints.points ?? 0;
      expect(points).toBe(0);
    });

    it('should handle null num_comments', () => {
      const articleWithNoComments = { ...mockArticle, num_comments: null };
      const comments = articleWithNoComments.num_comments ?? 0;
      expect(comments).toBe(0);
    });
  });

  describe('Date formatting logic', () => {
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      }
      return date.toLocaleDateString();
    };

    it('should format recent dates as minutes ago', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const result = formatDate(tenMinutesAgo);
      expect(result).toBe('10m ago');
    });

    it('should format dates as hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const result = formatDate(twoHoursAgo);
      expect(result).toBe('2h ago');
    });

    it('should format dates as days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatDate(threeDaysAgo);
      expect(result).toBe('3d ago');
    });

    it('should format old dates as locale date string', () => {
      const oldDate = new Date('2020-01-01').toISOString();
      const result = formatDate(oldDate);
      expect(result).toMatch(/\d+\/\d+\/\d+|\d+-\d+-\d+|[A-Z][a-z]+ \d+, \d+/);
    });
  });

  describe('URL extraction logic', () => {
    it('should prefer url over story_url', () => {
      const article = {
        url: 'https://example.com/article',
        story_url: 'https://example.com/story',
      };
      const url = article.url || article.story_url;
      expect(url).toBe('https://example.com/article');
    });

    it('should fall back to story_url when url is null', () => {
      const article = {
        url: null,
        story_url: 'https://example.com/story',
      };
      const url = article.url || article.story_url;
      expect(url).toBe('https://example.com/story');
    });
  });

  describe('Favorites logic', () => {
    it('should toggle favorite correctly - add', () => {
      const favoriteIds: string[] = [];
      const articleId = '1';
      
      const isFavorite = favoriteIds.includes(articleId);
      const newFavorites = isFavorite
        ? favoriteIds.filter((id) => id !== articleId)
        : [...favoriteIds, articleId];
      
      expect(newFavorites).toEqual(['1']);
    });

    it('should toggle favorite correctly - remove', () => {
      const favoriteIds = ['1', '2', '3'];
      const articleId = '2';
      
      const isFavorite = favoriteIds.includes(articleId);
      const newFavorites = isFavorite
        ? favoriteIds.filter((id) => id !== articleId)
        : [...favoriteIds, articleId];
      
      expect(newFavorites).toEqual(['1', '3']);
    });
  });
});
