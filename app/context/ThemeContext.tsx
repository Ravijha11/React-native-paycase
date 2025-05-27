import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
// Temporarily use SecureStore instead of AsyncStorage
import * as SecureStore from 'expo-secure-store';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    // Load saved theme mode from storage
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await SecureStore.getItemAsync('themeMode');
        if (savedThemeMode) {
          setThemeMode(savedThemeMode as ThemeMode);
          if (savedThemeMode === 'light') {
            setTheme('light');
          } else if (savedThemeMode === 'dark') {
            setTheme('dark');
          } else {
            setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
          }
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      }
    };

    loadThemeMode();
  }, [systemColorScheme]);

  useEffect(() => {
    // Save theme mode to storage when it changes
    const saveThemeMode = async () => {
      try {
        await SecureStore.setItemAsync('themeMode', themeMode);
      } catch (error) {
        console.error('Error saving theme mode:', error);
      }
    };

    saveThemeMode();

    // Update theme based on theme mode
    if (themeMode === 'system') {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        isDark: theme === 'dark',
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};