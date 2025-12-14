import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ArticleCard, SwipeableRow, EmptyState, LoadingSpinner } from '../../src/components';
import { 
  useArticlesQuery, 
  useDeletedIdsQuery, 
  useFavoritesQuery,
  useDeleteArticle 
} from '../../src/hooks/useArticles';
import { Article } from '../../src/types';

export default function ArticlesScreen() {
  const router = useRouter();
  
  const { data: articles = [], isLoading, isRefetching, refetch, error } = useArticlesQuery();
  const { data: deletedIds = [] } = useDeletedIdsQuery();
  const { data: favorites = [] } = useFavoritesQuery();
  const deleteArticleMutation = useDeleteArticle();

  const visibleArticles = articles.filter(
    (article) => !deletedIds.includes(article.objectID)
  );

  const handleArticlePress = useCallback(
    (article: Article) => {
      const url = article.url || article.story_url;
      const title = article.title || article.story_title || 'Article';
      if (url) {
        router.push({ pathname: '/webview', params: { url, title } });
      }
    },
    [router]
  );

  const handleDelete = useCallback(
    (article: Article) => {
      deleteArticleMutation.mutate({
        article,
        currentDeletedIds: deletedIds,
        currentFavorites: favorites,
      });
    },
    [deleteArticleMutation, deletedIds, favorites]
  );

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <SwipeableRow onDelete={() => handleDelete(item)}>
        <ArticleCard article={item} onPress={() => handleArticlePress(item)} />
      </SwipeableRow>
    ),
    [handleArticlePress, handleDelete]
  );

  const keyExtractor = useCallback((item: Article) => item.objectID, []);

  if (isLoading && visibleArticles.length === 0) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading articles..." />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>Failed to load articles</Text>
        </View>
      )}
      <FlatList
        data={visibleArticles}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={visibleArticles.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#888888"
          />
        }
        ListEmptyComponent={
          <EmptyState title="No Articles" subtitle="Pull down to refresh and load articles" />
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  emptyContainer: { flexGrow: 1 },
  errorBanner: { backgroundColor: '#ff3b30', paddingVertical: 10, paddingHorizontal: 16 },
  errorText: { color: '#ffffff', textAlign: 'center', fontSize: 14 },
});
