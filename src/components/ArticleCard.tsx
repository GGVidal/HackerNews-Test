import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Article } from '../types';
import { useArticlesStore } from '../store/useArticlesStore';

interface ArticleCardProps {
  article: Article;
  onPress: () => void;
  showRestoreButton?: boolean;
  onRestore?: () => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays < 7) {
    return `${diffDays}d`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}w`;
  }
  return 'Yesterday';
};

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress,
  showRestoreButton = false,
  onRestore,
}) => {
  const { favoriteIds, toggleFavorite } = useArticlesStore();
  const isFavorite = favoriteIds.includes(article.objectID);
  
  const title = article.title || article.story_title || 'Untitled';
  const author = article.author || 'Unknown';
  const date = formatDate(article.created_at);

  const handleLongPress = () => {
    toggleFavorite(article.objectID);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      activeOpacity={0.6}
      testID={`article-card-${article.objectID}`}
    >
      {isFavorite && (
        <View style={styles.favoriteIndicator}>
          <Text style={styles.favoriteIcon}>★</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, isFavorite && styles.favoriteTitle]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.meta}>
          {author} - {date}
        </Text>
      </View>
      
      {showRestoreButton && onRestore && (
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={onRestore}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`restore-button-${article.objectID}`}
        >
          <Text style={styles.restoreText}>Restore</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  favoriteIndicator: {
    marginRight: 8,
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#FFB800',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 4,
  },
  favoriteTitle: {
    color: '#333333',
  },
  meta: {
    fontSize: 13,
    color: '#888888',
  },
  restoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  restoreText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
