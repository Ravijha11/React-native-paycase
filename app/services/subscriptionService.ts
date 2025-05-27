import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

// Initialize RevenueCat
export const initializePurchases = (userId: string) => {
  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  Purchases.configure({
    apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY!,
  });
  
  // Identify the user with RevenueCat
  if (userId) {
    Purchases.logIn(userId);
  }
};

// Get available packages
export const getPackages = async (): Promise<PurchasesPackage[]> => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
};

// Purchase a package
export const purchasePackage = async (pkg: PurchasesPackage) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error) {
    console.error('Error purchasing package:', error);
    throw error;
  }
};

// Restore purchases
export const restorePurchases = async () => {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

// Check subscription status
export const checkSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return {
      isPro: customerInfo.entitlements.active.pro !== undefined,
      customerInfo,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { isPro: false, customerInfo: null };
  }
};