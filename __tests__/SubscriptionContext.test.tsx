import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { SubscriptionProvider, useSubscription } from '../app/context/SubscriptionContext';
import { Text, Button } from 'react-native';

// Mock RevenueCat Purchases
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    LOG_LEVEL: { DEBUG: 'debug' },
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    logIn: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    getCustomerInfo: jest.fn(),
  },
}));

// Mock Auth Context
jest.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Mock subscription service
jest.mock('../app/services/subscriptionService', () => ({
  initializePurchases: jest.fn(),
  getPackages: jest.fn().mockResolvedValue([{
    identifier: 'monthly',
    product: {
      title: 'Monthly Pro',
      priceString: '$9.99',
      description: 'Monthly subscription',
    },
  }]),
  checkSubscriptionStatus: jest.fn().mockResolvedValue({
    isPro: false,
    customerInfo: null,
  }),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
}));

const TestComponent = () => {
  const { isPro, packages, purchase, restore, refreshSubscription, isLoading } = useSubscription();
  
  return (
    <>
      <Text testID="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</Text>
      <Text testID="pro-state">{isPro ? 'Pro' : 'Not Pro'}</Text>
      <Text testID="packages-count">{packages.length}</Text>
      <Button testID="purchase" title="Purchase" onPress={() => purchase(packages[0])} />
      <Button testID="restore" title="Restore" onPress={restore} />
      <Button testID="refresh" title="Refresh" onPress={refreshSubscription} />
    </>
  );
};

describe('SubscriptionContext', () => {
  it('provides subscription state and methods', async () => {
    const { getByTestId } = render(
      <SubscriptionProvider>
        <TestComponent />
      </SubscriptionProvider>
    );
    
    // Initially loading
    expect(getByTestId('loading-state').props.children).toBe('Loading');
    
    // Wait for initial subscription check to complete
    await waitFor(() => {
      expect(getByTestId('loading-state').props.children).toBe('Not Loading');
    });
    
    // User should not be pro initially
    expect(getByTestId('pro-state').props.children).toBe('Not Pro');
    
    // Should have packages
    expect(getByTestId('packages-count').props.children).toBe(1);
    
    // Test purchase
    const mockPurchase = require('../app/services/subscriptionService').purchasePackage;
    mockPurchase.mockResolvedValueOnce({
      entitlements: { active: { pro: { isActive: true } } },
    });
    
    await act(async () => {
      fireEvent.press(getByTestId('purchase'));
    });
    
    expect(mockPurchase).toHaveBeenCalled();
    
    // Test restore
    const mockRestore = require('../app/services/subscriptionService').restorePurchases;
    mockRestore.mockResolvedValueOnce({
      entitlements: { active: { pro: { isActive: true } } },
    });
    
    await act(async () => {
      fireEvent.press(getByTestId('restore'));
    });
    
    expect(mockRestore).toHaveBeenCalled();
    
    // Test refresh
    const mockCheck = require('../app/services/subscriptionService').checkSubscriptionStatus;
    mockCheck.mockResolvedValueOnce({
      isPro: true,
      customerInfo: { entitlements: { active: { pro: { isActive: true } } } },
    });
    
    await act(async () => {
      fireEvent.press(getByTestId('refresh'));
    });
    
    expect(mockCheck).toHaveBeenCalled();
  });
});