import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useArticlesStore } from '../src/store/useArticlesStore';

export default function SettingsScreen() {
  const { notificationPrefs, setNotificationPrefs } = useArticlesStore();
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

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
});
