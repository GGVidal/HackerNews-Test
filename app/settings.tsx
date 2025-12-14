import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useArticlesStore } from '../src/store/useArticlesStore';
import { sendLocalNotification, forceCheckNewArticles } from '../src/services/notifications';

export default function SettingsScreen() {
  const { notificationPrefs, setNotificationPrefs } = useArticlesStore();
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value && permissionStatus !== 'granted') {
      await requestPermissions();
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') return;
    }
    setNotificationPrefs({ enabled: value });
  };

  const handleTestNotification = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications first.');
      return;
    }
    
    try {
      await sendLocalNotification(
        'Test Notification 🚀',
        'This is a test notification from HN Mobile Reader!',
        {
          url: 'https://news.ycombinator.com',
          title: 'Hacker News',
        }
      );
      Alert.alert('Success', 'Test notification sent! Check your notification center.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const handleCheckNewArticles = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications first.');
      return;
    }

    if (!notificationPrefs.enabled) {
      Alert.alert('Notifications Disabled', 'Please enable notifications in the settings above.');
      return;
    }
    
    setIsChecking(true);
    try {
      const result = await forceCheckNewArticles();
      
      if (result.found) {
        Alert.alert('New Articles Found! 🎉', result.message);
      } else {
        Alert.alert('No New Articles', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check for new articles.');
    } finally {
      setIsChecking(false);
    }
  };

  const renderSwitch = (title: string, value: boolean, onValueChange: (v: boolean) => void, disabled = false) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <Text style={[styles.settingTitle, disabled && styles.textDisabled]}>{title}</Text>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} trackColor={{ false: '#e0e0e0', true: '#34C759' }} thumbColor="#ffffff" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        {permissionStatus !== 'granted' && (
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
            <Text style={styles.permissionButtonText}>Enable Notifications</Text>
          </TouchableOpacity>
        )}
        {renderSwitch('Enable Notifications', notificationPrefs.enabled, handleToggleNotifications, permissionStatus !== 'granted')}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ARTICLE TYPES</Text>
        {renderSwitch('Android Articles', notificationPrefs.androidArticles, (v) => setNotificationPrefs({ androidArticles: v }), !notificationPrefs.enabled)}
        {renderSwitch('iOS Articles', notificationPrefs.iosArticles, (v) => setNotificationPrefs({ iosArticles: v }), !notificationPrefs.enabled)}
        {renderSwitch('React Native Articles', notificationPrefs.reactNativeArticles, (v) => setNotificationPrefs({ reactNativeArticles: v }), !notificationPrefs.enabled)}
        {renderSwitch('Flutter Articles', notificationPrefs.flutterArticles, (v) => setNotificationPrefs({ flutterArticles: v }), !notificationPrefs.enabled)}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TESTING</Text>
        <TouchableOpacity 
          style={[styles.checkButton, (permissionStatus !== 'granted' || !notificationPrefs.enabled) && styles.buttonDisabled]} 
          onPress={handleCheckNewArticles}
          disabled={permissionStatus !== 'granted' || !notificationPrefs.enabled || isChecking}
        >
          {isChecking ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Check for New Articles</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.testButton, permissionStatus !== 'granted' && styles.buttonDisabled]} 
          onPress={handleTestNotification}
          disabled={permissionStatus !== 'granted'}
        >
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Note: Background notifications require a development build. Use "Check for New Articles" to manually test the notification feature.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { marginTop: 20, backgroundColor: '#ffffff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e0e0e0' },
  sectionTitle: { fontSize: 13, color: '#888888', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#f5f5f5' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingItemDisabled: { opacity: 0.5 },
  settingTitle: { fontSize: 16, color: '#333333' },
  textDisabled: { color: '#888888' },
  permissionButton: { backgroundColor: '#007AFF', marginHorizontal: 16, marginVertical: 12, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  permissionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  checkButton: { backgroundColor: '#007AFF', marginHorizontal: 16, marginTop: 12, marginBottom: 8, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  testButton: { backgroundColor: '#34C759', marginHorizontal: 16, marginBottom: 12, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#a0a0a0' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  infoSection: { padding: 16 },
  infoText: { fontSize: 13, color: '#888888', textAlign: 'center', lineHeight: 18 },
});
