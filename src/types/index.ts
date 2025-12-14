export interface Article {
  objectID: string;
  title: string | null;
  url: string | null;
  author: string;
  created_at: string;
  story_title?: string | null;
  story_url?: string | null;
  points: number | null;
  num_comments: number | null;
}

export interface HackerNewsResponse {
  hits: Article[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

export interface NotificationPreferences {
  enabled: boolean;
  androidArticles: boolean;
  iosArticles: boolean;
  reactNativeArticles: boolean;
  flutterArticles: boolean;
}

