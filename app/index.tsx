import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from './context/AuthContext';
import { useSubscription } from './context/SubscriptionContext';
import { useTailwind } from 'tailwind-rn';
import { router } from 'expo-router';
import { Vibe, getVibes } from './services/vibeService';
import { getCachedVibes, cacheVibes } from './services/cacheService';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { isPro } = useSubscription();
  const tw = useTailwind();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadVibes = async (refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        setHasMore(true);
      }
      
      const currentPage = refresh ? 1 : page;
      
      // Try to get from cache first
      const cachedData = await getCachedVibes(10, (currentPage - 1) * 10);
      
      if (cachedData.length > 0 && !refresh) {
        setVibes(prev => refresh ? cachedData : [...prev, ...cachedData]);
      }
      
      // Then fetch from API
      const apiData = await getVibes(currentPage, 10);
      
      if (apiData.length === 0) {
        setHasMore(false);
      } else {
        setVibes(prev => refresh ? apiData : [...prev, ...apiData]);
        
        // Cache the new data
        await cacheVibes(apiData);
        
        if (!refresh) {
          setPage(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error loading vibes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVibes(true);
  };

  const onEndReached = () => {
    if (!loading && hasMore) {
      loadVibes();
    }
  };

  useEffect(() => {
    loadVibes();
  }, []);

  const renderItem = ({ item }: { item: Vibe }) => (
    <View style={tw('bg-white dark:bg-gray-800 p-4 mb-2 rounded-lg')}>
      <View style={tw('flex-row justify-between items-center mb-2')}>
        <Text style={tw('font-bold text-gray-800 dark:text-white')}>{item.user?.username || 'Anonymous'}</Text>
        <Text style={tw('text-xs text-gray-500 dark:text-gray-400')}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={tw('text-gray-700 dark:text-gray-300')}>{item.content}</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={tw('py-4')}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  };

  return (
    <View style={tw('flex-1 bg-gray-100 dark:bg-gray-900')}>
      <View style={tw('flex-row justify-between items-center p-4 bg-white dark:bg-gray-800')}>
        <Text style={tw('text-xl font-bold text-gray-800 dark:text-white')}>Vibes Feed</Text>
        <View style={tw('flex-row')}>
          <TouchableOpacity 
            style={tw('mr-4')}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-circle-outline" size={24} color={tw('text-gray-800 dark:text-white').color} />
          </TouchableOpacity>
          {!isPro && (
            <TouchableOpacity 
              style={tw('mr-4')}
              onPress={() => router.push('/subscription')}
            >
              <Ionicons name="star-outline" size={24} color={tw('text-gray-800 dark:text-white').color} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={signOut}>
            <Ionicons name="log-out-outline" size={24} color={tw('text-gray-800 dark:text-white').color} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={vibes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw('p-4')}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0000ff']}
          />
        }
        ListEmptyComponent={() => (
          <View style={tw('flex-1 justify-center items-center p-4')}>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Text style={tw('text-gray-500 dark:text-gray-400')}>No vibes found</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        style={tw('absolute bottom-4 right-4 bg-blue-500 p-4 rounded-full')}
        onPress={() => router.push('/create-vibe')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}