import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!url) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No URL provided</Text>
      </View>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: title || 'Article' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to load</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setError(null); setIsLoading(true); }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: title || 'Article' }} />
      <View style={styles.container}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#888888" />
          </View>
        )}
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(e) => setError(e.nativeEvent.description || 'Unknown error')}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  webview: { flex: 1 },
  loadingContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', zIndex: 1 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 32 },
  errorTitle: { fontSize: 17, fontWeight: '600', color: '#333333', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#888888', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6 },
  retryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
