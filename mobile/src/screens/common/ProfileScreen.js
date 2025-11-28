import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Card,
  Text,
  Button,
  TextInput,
  Avatar,
  Divider,
  Chip,
  List,
  Switch,
  Portal,
  Modal,
} from 'react-native-paper';
import { usersAPI, authAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { user, signOut, updateUser } = useContext(AuthContext);
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [driverDetails, setDriverDetails] = useState({
    vehicleType: '',
    vehicleNumber: '',
    vehicleModel: '',
    licenseNumber: '',
  });


  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setProfile(response.data);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  const handlePaymentDashboard = () => {
    navigation.navigate('PaymentDashboard');
  };

  const handleMyRides = () => {
    if (profile.role === 'driver') {
      navigation.navigate('MyRides');
    } else {
      navigation.navigate('Bookings');
    }
  };

  const handlePassengerDetails = () => {
    Alert.prompt(
      '🎒 Passenger Details',
      'Add your preferences and information:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: (preferences) => {
            Alert.alert('Success', 'Passenger details saved!');
            // In a real app, save to backend
          },
        },
      ],
      'plain-text',
      profile.passengerInfo?.preferences || ''
    );
  };

  const formatVehicleNumber = (text) => {
    // Remove non-alphanumeric characters
    let cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Format as TN49 BR3775 (Insert space after 4th character)
    if (cleaned.length > 4) {
      cleaned = cleaned.slice(0, 4) + ' ' + cleaned.slice(4);
    }

    return cleaned;
  };

  const handleDriverDetails = () => {
    // Pre-fill if data exists (mocking for now as profile might not have it yet)
    setDriverDetails({
      vehicleType: profile.vehicleInfo?.type || '',
      vehicleNumber: profile.vehicleInfo?.number || '',
      vehicleModel: profile.vehicleInfo?.model || '',
      licenseNumber: profile.driverInfo?.licenseNumber || '',
    });
    setShowDriverModal(true);
  };

  const saveDriverDetails = async () => {
    try {
      // Validate vehicle number format roughly
      // TN49 BR3775 -> 4 chars + space + 6 chars = 11 chars?
      // TN49BR3775 is 10 chars. With space it's 11.
      // Regex: ^[A-Z]{2}[0-9]{2}\s[A-Z0-9]{1,3}[0-9]{4}$ or similar

      // Simple check for now
      if (driverDetails.vehicleNumber.length < 8) {
        Alert.alert('Error', 'Please enter a valid vehicle number');
        return;
      }

      // In a real app, call API to update profile
      // await usersAPI.updateProfile({ vehicleInfo: ... });

      Alert.alert('Success', 'Driver details saved successfully!');
      setShowDriverModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save driver details');
    }
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Contact us:\n\nEmail: support@cityrider.com\nPhone: +91 1800-123-4567\n\nOr visit our website for FAQs and live chat support.',
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Email Us',
          onPress: () => Linking.openURL('mailto:support@cityrider.com'),
        },
      ]
    );
  };

  const handleSafety = () => {
    Alert.alert(
      'Safety',
      '🛡️ Your Safety Matters\n\n• Share your trip details with friends/family\n• Verify driver details before boarding\n• Use in-app messaging only\n• Report suspicious activity\n• Emergency contact: 112\n\nStay safe with CityRider!',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleReferInvite = () => {
    const referralCode = profile._id.substring(0, 8).toUpperCase();
    Alert.alert(
      'Refer & Invite',
      `🎁 Share CityRider with friends!\n\nYour Referral Code: ${referralCode}\n\nBoth you and your friend get ₹50 credit when they complete their first ride!`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => {
            // In a real app, use Share API
            Alert.alert('Share', 'Share functionality would open here');
          },
        },
      ]
    );
  };

  const handleAboutUs = () => {
    Alert.alert(
      'About CityRider',
      'CityRider - Ride Together, Save Together\n\nVersion: 1.0.0\n\nCityRider is a carpooling platform that connects drivers and passengers traveling in the same direction. Save money, reduce traffic, and help the environment!\n\n© 2025 CityRider. All rights reserved.',
      [{ text: 'Close', style: 'default' }]
    );
  };

  const handleAppLanguage = () => {
    Alert.alert(
      'App Language',
      'Select your preferred language:',
      [
        { text: 'English', onPress: () => Alert.alert('Language', 'English selected') },
        { text: 'हिंदी (Hindi)', onPress: () => Alert.alert('Language', 'Hindi selected') },
        { text: 'தமிழ் (Tamil)', onPress: () => Alert.alert('Language', 'Tamil selected') },
        { text: 'తెలుగు (Telugu)', onPress: () => Alert.alert('Language', 'Telugu selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTermsConditions = () => {
    Alert.alert(
      'Terms & Conditions',
      'By using CityRider, you agree to:\n\n• Provide accurate information\n• Respect other users\n• Follow traffic rules\n• Pay agreed fares\n• Report issues promptly\n\nFull terms available at:\nwww.cityrider.com/terms',
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Read Full Terms',
          onPress: () => Linking.openURL('https://www.cityrider.com/terms'),
        },
      ]
    );
  };

  const handleRating = () => {
    Alert.alert(
      'Rate CityRider',
      `Your current rating: ⭐ ${profile.rating || 'N/A'}\n\nEnjoy using CityRider? Rate us on the app store!`,
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: () => Alert.alert('Rating', 'Would open app store rating page'),
        },
      ]
    );
  };

  if (loading || !profile) {
    return null;
  }

  const containerStyle = {};
  const cardStyle = { ...styles.card, backgroundColor: 'rgba(255, 255, 255, 0.95)' };
  const textStyle = { color: theme.colors.text };
  const labelStyle = { ...styles.label, color: theme.colors.text };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg1.jpg')}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}
        resizeMode="cover"
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={containerStyle} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Profile Header */}
          <View style={styles.headerContainer}>
            <Avatar.Image
              size={120}
              source={{
                uri: profile.profilePicture || 'https://api.dicebear.com/7.x/avataaars/png?seed=Default'
              }}
              style={styles.avatar}
            />
            <Text variant="headlineSmall" style={styles.name}>
              {profile.name}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {profile.email}
            </Text>

            <View style={styles.badgesContainer}>
              <Chip mode="flat" style={styles.roleChip} textStyle={{ color: '#fff' }}>
                {profile.role.toUpperCase()}
              </Chip>
              {profile.uniqueId && (
                <TouchableOpacity
                  onPress={() => {
                    // Clipboard.setString(profile.uniqueId); // Requires expo-clipboard or similar
                    // For now, just show an alert
                    Alert.alert('Copied', `Unique ID ${profile.uniqueId} copied to clipboard!`);
                  }}
                >
                  <Chip
                    mode="flat"
                    style={styles.idChip}
                    textStyle={{ color: '#fff', fontWeight: 'bold' }}
                    icon="content-copy"
                  >
                    {profile.uniqueId}
                  </Chip>
                </TouchableOpacity>
              )}
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {profile.rating || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.roleSwitchContainer}>
              <Text variant="bodyMedium" style={{ color: '#fff', fontWeight: 'bold' }}>Driver Mode</Text>
              <Switch
                value={profile.role === 'driver'}
                onValueChange={async (value) => {
                  const newRole = value ? 'driver' : 'passenger';
                  try {
                    const response = await usersAPI.updateProfile({ role: newRole });
                    setProfile(response.data);
                    updateUser(response.data);
                  } catch (e) {
                    Alert.alert('Error', 'Failed to update role');
                  }
                }}
                color="#fff"
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#4caf50' }}
              />
            </View>
          </View>


          {/* Account Settings */}
          <Card style={cardStyle}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Account & Preferences
              </Text>
              <Divider style={styles.divider} />

              <List.Item
                title="My Rides"
                description={profile.role === 'driver' ? 'Manage your posted rides' : 'View your booking history'}
                left={props => <List.Icon {...props} icon="car-multiple" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleMyRides}
              />
              <Divider />

              {profile.role === 'passenger' && (
                <>
                  <List.Item
                    title="Ride History"
                    description="View past completed trips"
                    left={props => <List.Icon {...props} icon="history" color={theme.colors.primary} />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => navigation.navigate('RideHistory')}
                  />
                  <Divider />
                </>
              )}

              {profile.role === 'driver' && (
                <>
                  <List.Item
                    title="Posted Rides History"
                    description="View past posted rides"
                    left={props => <List.Icon {...props} icon="history" color={theme.colors.primary} />}
                    right={props => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() => navigation.navigate('PostRideHistory')}
                  />
                  <Divider />
                </>
              )}

              <List.Item
                title="Payment Dashboard"
                description="Manage payments & wallet"
                left={props => <List.Icon {...props} icon="wallet" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handlePaymentDashboard}
              />
              <Divider />

              <List.Item
                title="Passenger Details"
                description="Travel preferences & requirements"
                left={props => <List.Icon {...props} icon="bag-suitcase" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handlePassengerDetails}
              />
              <Divider />

              <List.Item
                title="Driver Details"
                description="Vehicle & license information"
                left={props => <List.Icon {...props} icon="steering" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleDriverDetails}
              />
              <Divider />

              <List.Item
                title="App Language"
                description="English (Default)"
                left={props => <List.Icon {...props} icon="translate" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleAppLanguage}
              />
              <Divider />

              <TouchableOpacity
                onPress={toggleTheme}
                style={styles.darkModeContainer}
                activeOpacity={0.7}
              >
                <View style={styles.darkModeLeft}>
                  <View style={[
                    styles.darkModeIconContainer,
                    isDarkMode && styles.darkModeIconContainerActive
                  ]}>
                    <Avatar.Icon
                      size={40}
                      icon={isDarkMode ? 'weather-night' : 'weather-sunny'}
                      style={[
                        styles.darkModeIcon,
                        isDarkMode ? styles.darkModeIconDark : styles.darkModeIconLight
                      ]}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.darkModeTextContainer}>
                    <Text variant="titleMedium" style={styles.darkModeTitle}>
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                    <Text variant="bodySmall" style={styles.darkModeDescription}>
                      {isDarkMode ? 'Easy on the eyes' : 'Bright and clear'}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.customSwitch,
                  isDarkMode && styles.customSwitchActive
                ]}>
                  <View style={[
                    styles.customSwitchThumb,
                    isDarkMode && styles.customSwitchThumbActive
                  ]}>
                    <Text style={styles.customSwitchIcon}>
                      {isDarkMode ? '🌙' : '☀️'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          {/* Support & Legal */}
          <Card style={cardStyle}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Support & Legal
              </Text>
              <Divider style={styles.divider} />

              <List.Item
                title="Help & Support"
                left={props => <List.Icon {...props} icon="help-circle-outline" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleHelpSupport}
              />
              <Divider />

              <List.Item
                title="Safety Center"
                left={props => <List.Icon {...props} icon="shield-check-outline" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleSafety}
              />
              <Divider />

              <List.Item
                title="Refer & Earn"
                left={props => <List.Icon {...props} icon="gift-outline" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleReferInvite}
              />
              <Divider />

              <List.Item
                title="Terms & Conditions"
                left={props => <List.Icon {...props} icon="file-document-outline" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleTermsConditions}
              />
              <Divider />

              <List.Item
                title="Rate Us"
                left={props => <List.Icon {...props} icon="star-outline" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleRating}
              />
              <Divider />

              <List.Item
                title="About CityRider"
                left={props => <List.Icon {...props} icon="information-outline" color={theme.colors.primary} />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={handleAboutUs}
              />
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleSignOut}
            style={styles.logoutButton}
            buttonColor="#ff5252"
            icon="logout"
            contentStyle={{ height: 50 }}
          >
            Log Out
          </Button>

          <Text style={styles.versionText}>Version 1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <Portal>
        <Modal
          visible={showDriverModal}
          onDismiss={() => setShowDriverModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>Driver Details</Text>
          <ScrollView>
            <TextInput
              label="Vehicle Type (e.g., Sedan, SUV)"
              value={driverDetails.vehicleType}
              onChangeText={(text) => setDriverDetails({ ...driverDetails, vehicleType: text })}
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="Vehicle Number (e.g., TN49 BR3775)"
              value={driverDetails.vehicleNumber}
              onChangeText={(text) => setDriverDetails({ ...driverDetails, vehicleNumber: formatVehicleNumber(text) })}
              mode="outlined"
              style={styles.modalInput}
              maxLength={13} // TN49 BR3775 is 11 chars, allowing some buffer
              autoCapitalize="characters"
            />
            <TextInput
              label="Vehicle Model (e.g., Swift Dzire)"
              value={driverDetails.vehicleModel}
              onChangeText={(text) => setDriverDetails({ ...driverDetails, vehicleModel: text })}
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="License Number"
              value={driverDetails.licenseNumber}
              onChangeText={(text) => setDriverDetails({ ...driverDetails, licenseNumber: text.toUpperCase() })}
              mode="outlined"
              style={styles.modalInput}
              autoCapitalize="characters"
            />
            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setShowDriverModal(false)} style={styles.modalButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={saveDriverDetails} style={styles.modalButton}>
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: '#fff',
    elevation: 4,
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  email: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  roleChip: {
    backgroundColor: '#2196f3',
  },
  idChip: {
    backgroundColor: '#ff9800',
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  roleSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 12,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  divider: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
    fontSize: 12,
  },
  darkModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
    borderRadius: 12,
    marginVertical: 8,
  },
  darkModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  darkModeIconContainer: {
    marginRight: 16,
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#FDB813',
  },
  darkModeIconContainerActive: {
    backgroundColor: '#1a1a2e',
  },
  darkModeIcon: {
    backgroundColor: 'transparent',
  },
  darkModeIconLight: {
    // Light mode icon styling
  },
  darkModeIconDark: {
    // Dark mode icon styling
  },
  darkModeTextContainer: {
    flex: 1,
  },
  darkModeTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  darkModeDescription: {
    color: '#666',
    fontSize: 12,
  },
  customSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  customSwitchActive: {
    backgroundColor: '#6200ee',
  },
  customSwitchThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  customSwitchThumbActive: {
    alignSelf: 'flex-end',
  },
  customSwitchIcon: {
    fontSize: 14,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  modalButton: {
    flex: 1,
  },
});
