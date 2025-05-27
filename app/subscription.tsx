import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { router } from 'expo-router';
import { useSubscription } from './context/SubscriptionContext';
import { Ionicons } from '@expo/vector-icons';
import { purchasePackage, restorePurchases } from './services/subscriptionService';

export default function SubscriptionScreen() {
  const tw = useTailwind();
  const { packages, isPro, refreshSubscription, customerInfo } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (packageId: string) => {
    setLoading(true);
    try {
      const pkg = packages.find(p => p.identifier === packageId);
      if (!pkg) {
        throw new Error('Package not found');
      }
      
      await purchasePackage(pkg);
      await refreshSubscription();
      Alert.alert('Success', 'Thank you for your purchase!');
      router.back();
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Failed', error.message || 'An error occurred during purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await restorePurchases();
      await refreshSubscription();
      Alert.alert('Restore Complete', 'Your purchases have been restored');
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Restore Failed', error.message || 'An error occurred during restore');
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
        <Text style={tw('text-xl font-bold text-gray-800 dark:text-white')}>Upgrade to Pro</Text>
        <View style={tw('w-6')} />
      </View>

      <ScrollView contentContainerStyle={tw('p-4')}>
        <View style={tw('bg-white dark:bg-gray-800 rounded-lg p-6 mb-4')}>
          <Text style={tw('text-2xl font-bold text-center text-gray-800 dark:text-white mb-2')}>
            Unlock Premium Features
          </Text>
          <Text style={tw('text-center text-gray-600 dark:text-gray-400 mb-6')}>
            Get unlimited vibes, ad-free experience, and more!
          </Text>

          {isPro ? (
            <View style={tw('bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-4')}>
              <Text style={tw('text-center text-green-800 dark:text-green-200 font-bold')}>
                You're a Pro member!
              </Text>
              <Text style={tw('text-center text-green-700 dark:text-green-300 mt-2')}>
                Your subscription is active until {customerInfo?.entitlements?.active?.pro?.expirationDate 
                  ? new Date(customerInfo.entitlements.active.pro.expirationDate).toLocaleDateString() 
                  : 'unknown'}
              </Text>
            </View>
          ) : (
            <View style={tw('space-y-4')}>
              {packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={tw('border border-gray-300 dark:border-gray-700 rounded-lg p-4')}
                  onPress={() => handlePurchase(pkg.identifier)}
                  disabled={loading}
                >
                  <Text style={tw('text-lg font-bold text-gray-800 dark:text-white')}>
                    {pkg.product.title}
                  </Text>
                  <Text style={tw('text-gray-600 dark:text-gray-400')}>
                    {pkg.product.description}
                  </Text>
                  <Text style={tw('text-right font-bold text-blue-600 dark:text-blue-400 mt-2')}>
                    {pkg.product.priceString}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={tw('mt-6 p-3 rounded-lg border border-gray-300 dark:border-gray-700')}
            onPress={handleRestore}
            disabled={loading}
          >
            <Text style={tw('text-center text-gray-700 dark:text-gray-300')}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </View>

        <View style={tw('bg-white dark:bg-gray-800 rounded-lg p-6')}>
          <Text style={tw('text-lg font-bold text-gray-800 dark:text-white mb-4')}>
            Pro Features
          </Text>
          
          <View style={tw('space-y-3')}>
            <View style={tw('flex-row items-center')}>
              <Ionicons name="checkmark-circle" size={20} color={tw('text-green-500').color} />
              <Text style={tw('ml-2 text-gray-700 dark:text-gray-300')}>Unlimited vibes</Text>
            </View>
            <View style={tw('flex-row items-center')}>
              <Ionicons name="checkmark-circle" size={20} color={tw('text-green-500').color} />
              <Text style={tw('ml-2 text-gray-700 dark:text-gray-300')}>Ad-free experience</Text>
            </View>
            <View style={tw('flex-row items-center')}>
              <Ionicons name="checkmark-circle" size={20} color={tw('text-green-500').color} />
              <Text style={tw('ml-2 text-gray-700 dark:text-gray-300')}>Premium themes</Text>
            </View>
            <View style={tw('flex-row items-center')}>
              <Ionicons name="checkmark-circle" size={20} color={tw('text-green-500').color} />
              <Text style={tw('ml-2 text-gray-700 dark:text-gray-300')}>Priority support</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {loading && (
        <View style={tw('absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center')}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}