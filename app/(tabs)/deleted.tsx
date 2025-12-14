import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArticleCard, EmptyState } from '../../src/components';
import { useArticlesStore } from '../../src/store/useArticlesStore';
import { Article } from '../../src/types';
import * as storage from '../../src/services/storage';

export default function DeletedScreen() {
  const router = useRouter();
  const { deletedIds, restoreArticle } = useArticlesStore();
  const [deletedArticles, setDeletedArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadDeletedArticles = async () => {
      const articles = await storage.getDeletedArticles();
      const validDeleted = articles.filter((article) =>
        deletedIds.includes(article.objectID)
      );
      setDeletedArticles(validDeleted);
    };
    loadDeletedArticles();
  }, [deletedIds]);

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

  const handleRestore = useCallback(
    (articleId: string) => {
      restoreArticle(articleId);
    },
    [restoreArticle]
  );

  const renderItem = useCallback(
    ({ item }: { item: Article }) => (
      <ArticleCard
        article={item}
        onPress={() => handleArticlePress(item)}
        showRestoreButton={true}
        onRestore={() => handleRestore(item.objectID)}
      />
    ),
    [handleArticlePress, handleRestore]
  );

  const keyExtractor = useCallback((item: Article) => item.objectID, []);

  return (
    <View style={styles.container}>
      {deletedArticles.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {deletedArticles.length} deleted article{deletedArticles.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <FlatList
        data={deletedArticles}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={deletedArticles.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <EmptyState title="No Deleted Articles" subtitle="Articles you delete will appear here" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerText: { color: '#666666', fontSize: 13 },
  emptyContainer: { flexGrow: 1 },
});
