import React, { createContext, useContext, useEffect, useState } from 'react';
import { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { 
  checkSubscriptionStatus, 
  getPackages, 
  initializePurchases,
  purchasePackage,
  restorePurchases
} from '../services/subscriptionService';
import { useAuth } from './AuthContext';

type SubscriptionContextType = {
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  packages: PurchasesPackage[];
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      const { isPro, customerInfo } = await checkSubscriptionStatus();
      setIsPro(isPro);
      setCustomerInfo(customerInfo);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const purchase = async (pkg: PurchasesPackage) => {
    setIsLoading(true);
    try {
      const info = await purchasePackage(pkg);
      setCustomerInfo(info);
      setIsPro(info.entitlements.active.pro !== undefined);
    } catch (error) {
      console.error('Error purchasing package:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const restore = async () => {
    setIsLoading(true);
    try {
      const info = await restorePurchases();
      setCustomerInfo(info);
      setIsPro(info.entitlements.active.pro !== undefined);
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Initialize RevenueCat
      initializePurchases(user.id);
      
      // Load packages and subscription status
      const loadData = async () => {
        setIsLoading(true);
        try {
          const [pkgs, status] = await Promise.all([
            getPackages(),
            checkSubscriptionStatus(),
          ]);
          setPackages(pkgs);
          setIsPro(status.isPro);
          setCustomerInfo(status.customerInfo);
        } catch (error) {
          console.error('Error loading subscription data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ 
      isPro, 
      customerInfo, 
      packages, 
      isLoading,
      refreshSubscription,
      purchase,
      restore
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};