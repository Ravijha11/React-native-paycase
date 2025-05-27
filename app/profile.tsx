import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { router } from 'expo-router';
import { useAuth } from './context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getProfile, updateProfile, uploadAvatar } from './services/profileService';
import * as ImagePicker from 'expo-image-picker';

type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  notifications_enabled: boolean;
};

export default function ProfileScreen() {
  const tw = useTailwind();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileData = await getProfile();
      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || '');
        setNotificationsEnabled(profileData.notifications_enabled || false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedProfile = await updateProfile({
        username,
        notifications_enabled: notificationsEnabled,
      });
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload an avatar');
        return;
      }
      
      setUploadingAvatar(true);
      const avatarUrl = await uploadAvatar();
      
      if (avatarUrl) {
        setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
        Alert.alert('Success', 'Avatar uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <View style={tw('flex-1 justify-center items-center bg-gray-100 dark:bg-gray-900')}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tw('flex-1 bg-gray-100 dark:bg-gray-900')}>
      <View style={tw('flex-row justify-between items-center p-4 bg-white dark:bg-gray-800')}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={tw('text-gray-800 dark:text-white').color} />
        </TouchableOpacity>
        <Text style={tw('text-xl font-bold text-gray-800 dark:text-white')}>Profile</Text>
        <TouchableOpacity onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color={tw('text-gray-800 dark:text-white').color} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={tw('p-4')}>
        <View style={tw('bg-white dark:bg-gray-800 rounded-lg p-6 mb-4')}>
          <View style={tw('items-center mb-6')}>
            <TouchableOpacity 
              style={tw('relative')}
              onPress={handleAvatarUpload}
              disabled={uploadingAvatar}
            >
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={tw('w-24 h-24 rounded-full')}
                />
              ) : (
                <View style={tw('w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 justify-center items-center')}>
                  <Ionicons name="person" size={40} color={tw('text-gray-500 dark:text-gray-400').color} />
                </View>
              )}
              
              <View style={tw('absolute bottom-0 right-0 bg-blue-500 rounded-full p-2')}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
              
              {uploadingAvatar && (
                <View style={tw('absolute inset-0 bg-black bg-opacity-50 rounded-full justify-center items-center')}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
            </TouchableOpacity>
            
            <Text style={tw('mt-2 text-sm text-gray-500 dark:text-gray-400')}>
              Tap to change avatar
            </Text>
          </View>

          <View style={tw('mb-4')}>
            <Text style={tw('text-sm font-medium text-gray-700 dark:text-gray-300 mb-1')}>
              Email
            </Text>
            <Text style={tw('p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white')}>
              {user?.email || 'No email'}
            </Text>
          </View>

          <View style={tw('mb-4')}>
            <Text style={tw('text-sm font-medium text-gray-700 dark:text-gray-300 mb-1')}>
              Username
            </Text>
            <TextInput
              style={tw('p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white')}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={tw('text-gray-500 dark:text-gray-400').color}
            />
          </View>

          <View style={tw('flex-row justify-between items-center mb-6')}>
            <Text style={tw('text-sm font-medium text-gray-700 dark:text-gray-300')}>
              Enable Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={tw('bg-blue-500 p-3 rounded-lg')}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={tw('text-white text-center font-bold')}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}