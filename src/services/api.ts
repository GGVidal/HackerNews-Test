import { HackerNewsResponse, Article } from '../types';

const BASE_URL = 'https://hn.algolia.com/api/v1';

export const fetchArticles = async (query: string = 'mobile'): Promise<Article[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search_by_date?query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: HackerNewsResponse = await response.json();
    
    // Filter out articles without titles or urls
    return data.hits.filter(
      (article) => 
        (article.title || article.story_title) && 
        (article.url || article.story_url)
    );
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

export const fetchArticlesByTopics = async (topics: string[]): Promise<Article[]> => {
  try {
    const allArticles: Article[] = [];
    
    for (const topic of topics) {
      const articles = await fetchArticles(topic);
      allArticles.push(...articles);
    }
    
    // Remove duplicates based on objectID
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.objectID, article])).values()
    );
    
    // Sort by date (newest first)
    return uniqueArticles.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching articles by topics:', error);
    throw error;
  }
};

