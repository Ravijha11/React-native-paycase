import React, { useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { useSubscription } from './context/SubscriptionContext';
import { PurchasesPackage } from 'react-native-purchases';

const PaywallScreen = () => {
  const { packages, isLoading, purchase, restore, isPro } = useSubscription();

  useEffect(() => {
    // You might want to refresh packages or subscription status when the paywall is opened
    // For now, the SubscriptionContext handles initial loading.
  }, []);

  const renderPackage = ({ item }: { item: PurchasesPackage }) => (
    <View style={styles.packageItem}>
      <Text style={styles.packageTitle}>{item.product.title}</Text>
      <Text style={styles.packagePrice}>{item.product.priceString}</Text>
      <Button title={`Buy ${item.product.priceString}`} onPress={() => purchase(item)} disabled={isLoading} />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading packages...</Text>
      </View>
    );
  }

  if (isPro) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are already subscribed!</Text>
        <Button title="Restore Purchases" onPress={restore} disabled={isLoading} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Subscription Plan</Text>
      <FlatList
        data={packages}
        renderItem={renderPackage}
        keyExtractor={(item) => item.identifier}
        ListEmptyComponent={<Text>No subscription packages available.</Text>}
      />
      <Button title="Restore Purchases" onPress={restore} disabled={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  packageItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  packagePrice: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
});

export default PaywallScreen;