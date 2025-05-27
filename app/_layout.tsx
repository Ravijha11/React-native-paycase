import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect } from 'react';
import { initDatabase } from './services/cacheService';
import { TailwindProvider } from 'tailwind-rn';
import utilities from '../tailwind.json';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  useEffect(() => {
    // Initialize the SQLite database
    initDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <TailwindProvider utilities={utilities}>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
              },
              headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? '#111827' : '#F9FAFB',
              },
            }}
          />
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
    </TailwindProvider>
  );
}