import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchArticles } from '../services/api';
import * as storage from '../services/storage';
import { Article } from '../types';

export const QUERY_KEYS = {
  articles: ['articles'] as const,
  deletedArticles: ['deletedArticles'] as const,
  favorites: ['favorites'] as const,
  deleted: ['deleted'] as const,
};

export const useArticlesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.articles,
    queryFn: async () => {
      try {
        const articles = await fetchArticles('mobile');
        const sortedArticles = articles.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        await storage.saveArticles(sortedArticles);
        if (sortedArticles.length > 0) {
          await storage.saveLastArticleId(sortedArticles[0].objectID);
        }
        return sortedArticles;
      } catch (error) {
        const cachedArticles = await storage.getArticles();
        if (cachedArticles.length > 0) {
          return cachedArticles;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return true;
    },
  });
};

export const useDeletedArticlesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.deletedArticles,
    queryFn: () => storage.getDeletedArticles(),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export const useFavoritesQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.favorites,
    queryFn: () => storage.getFavorites(),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export const useDeletedIdsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.deleted,
    queryFn: () => storage.getDeleted(),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleId, currentFavorites }: { articleId: string; currentFavorites: string[] }) => {
      const isFavorite = currentFavorites.includes(articleId);
      const newFavorites = isFavorite
        ? currentFavorites.filter((id) => id !== articleId)
        : [...currentFavorites, articleId];
      await storage.saveFavorites(newFavorites);
      return newFavorites;
    },
    onMutate: async ({ articleId, currentFavorites }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.favorites });
      const previousFavorites = queryClient.getQueryData(QUERY_KEYS.favorites);
      const isFavorite = currentFavorites.includes(articleId);
      const newFavorites = isFavorite
        ? currentFavorites.filter((id) => id !== articleId)
        : [...currentFavorites, articleId];
      queryClient.setQueryData(QUERY_KEYS.favorites, newFavorites);
      return { previousFavorites };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(QUERY_KEYS.favorites, context.previousFavorites);
      }
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      article, 
      currentDeletedIds, 
      currentFavorites 
    }: { 
      article: Article; 
      currentDeletedIds: string[]; 
      currentFavorites: string[];
    }) => {
      const newDeletedIds = [...currentDeletedIds, article.objectID];
      const newFavorites = currentFavorites.filter((id) => id !== article.objectID);
      
      const existingDeletedArticles = await storage.getDeletedArticles();
      const newDeletedArticles = [
        ...existingDeletedArticles.filter(a => a.objectID !== article.objectID),
        article,
      ];
      
      await Promise.all([
        storage.saveDeleted(newDeletedIds),
        storage.saveFavorites(newFavorites),
        storage.saveDeletedArticles(newDeletedArticles),
      ]);
      
      return { newDeletedIds, newFavorites, newDeletedArticles };
    },
    onMutate: async ({ article, currentDeletedIds, currentFavorites }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.deleted });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.favorites });
      
      const previousDeletedIds = queryClient.getQueryData(QUERY_KEYS.deleted);
      const previousFavorites = queryClient.getQueryData(QUERY_KEYS.favorites);
      
      queryClient.setQueryData(QUERY_KEYS.deleted, [...currentDeletedIds, article.objectID]);
      queryClient.setQueryData(QUERY_KEYS.favorites, currentFavorites.filter((id) => id !== article.objectID));
      
      return { previousDeletedIds, previousFavorites };
    },
    onSuccess: ({ newDeletedArticles }) => {
      queryClient.setQueryData(QUERY_KEYS.deletedArticles, newDeletedArticles);
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDeletedIds) {
        queryClient.setQueryData(QUERY_KEYS.deleted, context.previousDeletedIds);
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(QUERY_KEYS.favorites, context.previousFavorites);
      }
    },
  });
};

export const useRestoreArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      articleId, 
      currentDeletedIds 
    }: { 
      articleId: string; 
      currentDeletedIds: string[];
    }) => {
      const newDeletedIds = currentDeletedIds.filter((id) => id !== articleId);
      const deletedArticles = await storage.getDeletedArticles();
      const newDeletedArticles = deletedArticles.filter((a) => a.objectID !== articleId);
      
      await Promise.all([
        storage.saveDeleted(newDeletedIds),
        storage.saveDeletedArticles(newDeletedArticles),
      ]);
      
      return { newDeletedIds, newDeletedArticles };
    },
    onMutate: async ({ articleId, currentDeletedIds }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.deleted });
      
      const previousDeletedIds = queryClient.getQueryData(QUERY_KEYS.deleted);
      queryClient.setQueryData(QUERY_KEYS.deleted, currentDeletedIds.filter((id) => id !== articleId));
      
      return { previousDeletedIds };
    },
    onSuccess: ({ newDeletedIds, newDeletedArticles }) => {
      queryClient.setQueryData(QUERY_KEYS.deleted, newDeletedIds);
      queryClient.setQueryData(QUERY_KEYS.deletedArticles, newDeletedArticles);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.articles });
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDeletedIds) {
        queryClient.setQueryData(QUERY_KEYS.deleted, context.previousDeletedIds);
      }
    },
  });
};
