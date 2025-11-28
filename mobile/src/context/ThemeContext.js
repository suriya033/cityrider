import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Use system preference if no saved preference
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode
    ? {
        colors: {
          primary: '#6200ee',
          accent: '#03dac4',
          background: '#121212',
          surface: '#1e1e1e',
          text: '#ffffff',
          placeholder: '#9e9e9e',
          error: '#cf6679',
          success: '#4caf50',
          border: '#333333',
          card: '#2c2c2c',
        },
        isDark: true,
      }
    : {
        colors: {
          primary: '#6200ee',
          accent: '#03dac4',
          background: '#f5f5f5',
          surface: '#ffffff',
          text: '#000000',
          placeholder: '#757575',
          error: '#b00020',
          success: '#4caf50',
          border: '#e0e0e0',
          card: '#ffffff',
        },
        isDark: false,
      };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

