import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LogBox, ErrorUtils } from 'react-native';

// Ignore all logs and warnings
LogBox.ignoreAllLogs();

// Global error handler to prevent crashes
if (ErrorUtils) {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.log('Global error caught:', error);
    if (!isFatal) {
      // Ignore non-fatal errors
      return;
    }
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/common/HomeScreen';
import SearchRidesScreen from './src/screens/passenger/SearchRidesScreen';
import RideDetailScreen from './src/screens/passenger/RideDetailScreen';
import MyBookingsScreen from './src/screens/passenger/MyBookingsScreen';
import PostRideCommon from './src/screens/common/PostRideScreen';
import MyRidesScreen from './src/screens/driver/MyRidesScreen';
import ManageRideScreen from './src/screens/driver/ManageRideScreen';
import ProfileScreen from './src/screens/common/ProfileScreen';
import MessagesScreen from './src/screens/common/MessagesScreen';
import ChatScreen from './src/screens/common/ChatScreen';
import EditProfileScreen from './src/screens/common/EditProfileScreen';
import ViewProfileScreen from './src/screens/common/ViewProfileScreen';
import RideHistoryScreen from './src/screens/passenger/RideHistoryScreen';
import RideProgressScreen from './src/screens/passenger/RideProgressScreen';
import PostRideHistoryScreen from './src/screens/driver/PostRideHistoryScreen';
import PaymentConfirmationScreen from './src/screens/driver/PaymentConfirmationScreen';
import PaymentDashboardScreen from './src/screens/common/PaymentDashboardScreen';

import { AuthContext } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { theme as defaultTheme } from './src/theme';
import { authAPI } from './src/services/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Unified Tab Navigator - Users can do both driver and passenger functions
function MainTabs() {
  const { theme } = useTheme();
  const { user } = React.useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'MyRides') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      {user?.role === 'passenger' && (
        <Tab.Screen
          name="Bookings"
          component={MyBookingsScreen}
          options={{ title: 'My Trips' }}
        />
      )}

      {user?.role === 'driver' && (
        <Tab.Screen
          name="MyRides"
          component={MyRidesScreen}
          options={{ title: 'My Drives' }}
        />
      )}

      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        try {
          // Verify token is still valid by making a request to /auth/me
          const response = await authAPI.getCurrentUser();

          // Token is valid, update user data
          setUserToken(token);
          setUser(response.data);

          // Update stored user data in case it changed
          await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        } catch (error) {
          // Check if it's a network error (backend unreachable)
          if (error.message && (error.message.includes('Network Error') ||
            error.message.includes('timeout') ||
            error.message.includes('Cannot connect'))) {
            // Network error - keep user logged in with cached data
            console.log('Backend unreachable, using cached user data');
            setUserToken(token);
            setUser(JSON.parse(userData));
          } else {
            // Token is invalid or expired, clear storage
            console.log('Token validation failed, clearing auth data');
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            setUserToken(null);
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, try to use cached data if available
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');
        if (token && userData) {
          setUserToken(token);
          setUser(JSON.parse(userData));
        }
      } catch (cacheError) {
        console.error('Cache read error:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const authContext = {
    signIn: async (token, userData) => {
      try {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUserToken(token);
        setUser(userData);
      } catch (error) {
        console.error('Sign in error:', error);
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
        setUser(null);
      } catch (error) {
        console.error('Sign out error:', error);
      }
    },
    updateUser: (userData) => {
      setUser(userData);
      AsyncStorage.setItem('userData', JSON.stringify(userData));
    },
    user,
    userToken,
  };

  if (isLoading) {
    return null; // You can add a splash screen here
  }

  // Create paper theme from our theme, preserving elevation levels
  const paperTheme = {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      primary: theme.colors.primary,
      accent: theme.colors.accent,
      background: theme.colors.background,
      surface: theme.colors.surface,
      text: theme.colors.text,
      placeholder: theme.colors.placeholder,
      error: theme.colors.error,
    },
    // Preserve elevation from defaultTheme (which now includes level3 etc.)
    elevation: defaultTheme.elevation,
    dark: theme.isDark,
  };

  return (
    <PaperProvider theme={paperTheme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer theme={paperTheme}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: theme.colors.background }
            }}
          >
            {userToken ? (
              <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="PostRide" component={PostRideCommon} />
                <Stack.Screen name="PostRideCommon" component={PostRideCommon} />
                <Stack.Screen name="RideDetail" component={RideDetailScreen} />
                <Stack.Screen name="ManageRide" component={ManageRideScreen} options={{ title: 'Manage Ride' }} />
                <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} options={{ title: 'Confirm Payment', headerShown: false }} />
                <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.userName })} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
                <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
                <Stack.Screen name="RideProgress" component={RideProgressScreen} />
                <Stack.Screen name="PostRideHistory" component={PostRideHistoryScreen} />
                <Stack.Screen name="PaymentDashboard" component={PaymentDashboardScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider >
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
