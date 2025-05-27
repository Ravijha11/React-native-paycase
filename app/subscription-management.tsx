import React, { useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useSubscription } from './context/SubscriptionContext';

const SubscriptionManagementScreen = () => {
  const { customerInfo, isLoading, restore, isPro } = useSubscription();

  useEffect(() => {
    // You might want to refresh subscription status when this screen is opened
    // For now, the SubscriptionContext handles initial loading and updates.
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading subscription info...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription Status</Text>
      {isPro ? (
        <View>
          <Text style={styles.statusText}>You have an active subscription.</Text>
          {customerInfo?.entitlements.active.pro?.expirationDate && (
            <Text style={styles.statusText}>Expires: {new Date(customerInfo.entitlements.active.pro.expirationDate).toLocaleDateString()}</Text>
          )}
          {/* Add more details from customerInfo if needed */}
        </View>
      ) : (
        <Text style={styles.statusText}>You do not have an active subscription.</Text>
      )}
      
      <Button title="Restore Purchases" onPress={restore} disabled={isLoading} />
      {/* Add a button to navigate to the Paywall screen if needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default SubscriptionManagementScreen;