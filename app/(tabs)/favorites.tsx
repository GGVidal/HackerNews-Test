import React, { useCallback, useMemo } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ArticleCard, SwipeableRow, EmptyState } from '../../src/components';
import { useArticlesStore } from '../../src/store/useArticlesStore';
import { Article } from '../../src/types';

export default function FavoritesScreen() {
  const router = useRouter();
  const { articles, favoriteIds, deletedIds, deleteArticle } = useArticlesStore();

  const favoriteArticles = useMemo(() => {
    return articles.filter(
      (article) =>
        favoriteIds.includes(article.objectID) &&
        !deletedIds.includes(article.objectID)
    );
  }, [articles, favoriteIds, deletedIds]);

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
    (articleId: string) => {
      deleteArticle(articleId);
    },
    [deleteArticle]
  );

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <SwipeableRow onDelete={() => handleDelete(item.objectID)}>
        <ArticleCard article={item} onPress={() => handleArticlePress(item)} />
      </SwipeableRow>
    ),
    [handleArticlePress, handleDelete]
  );

  const keyExtractor = useCallback((item: Article) => item.objectID, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlatList
        data={favoriteArticles}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={favoriteArticles.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <EmptyState title="No Favorites" subtitle="Long press on any article to add it to favorites" />
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  emptyContainer: { flexGrow: 1 },
});
