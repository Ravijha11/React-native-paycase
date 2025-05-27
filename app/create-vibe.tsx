import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createVibe } from './services/vibeService';
import { useSubscription } from './context/SubscriptionContext';

export default function CreateVibeScreen() {
  const tw = useTailwind();
  const { isPro } = useSubscription();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    // Add a check for pro users if you want to limit vibe creation
    if (!isPro && content.length > 140) {
      Alert.alert('Pro Feature', 'Only Pro users can create vibes longer than 140 characters. Upgrade to Pro?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/subscription') }
      ]);
      return;
    }

    setLoading(true);
    try {
      const newVibe = await createVibe(content);
      if (newVibe) {
        Alert.alert('Success', 'Vibe created successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error creating vibe:', error);
      Alert.alert('Error', 'Failed to create vibe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw('flex-1 bg-gray-100 dark:bg-gray-900')}>
      <View style={tw('flex-row justify-between items-center p-4 bg-white dark:bg-gray-800')}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={tw('text-gray-800 dark:text-white').color} />
        </TouchableOpacity>
        <Text style={tw('text-xl font-bold text-gray-800 dark:text-white')}>Create Vibe</Text>
        <View style={tw('w-6')} />
      </View>

      <View style={tw('p-4')}>
        <View style={tw('bg-white dark:bg-gray-800 rounded-lg p-4')}>
          <TextInput
            style={tw('text-gray-800 dark:text-white min-h-[120px] text-base')}
            placeholder="What's your vibe today?"
            placeholderTextColor={tw('text-gray-500 dark:text-gray-400').color}
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={280}
          />
          
          <View style={tw('flex-row justify-between items-center mt-2')}>
            <Text style={tw('text-gray-500 dark:text-gray-400')}>
              {content.length}/280
            </Text>
            
            <TouchableOpacity
              style={tw('bg-blue-500 px-4 py-2 rounded-full')}
              onPress={handleSubmit}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={tw('text-white font-bold')}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}