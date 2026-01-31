// HomeScreen.js – Enhanced UI with SafeAreaView, LinearGradient, glassmorphism, and smooth animations
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  RefreshControl,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import {
  TextInput,
  Card,
  Text,
  Button,
  Chip,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ridesAPI, bookingsAPI } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// UI CONSTANTS – colors, animation timings, etc.
// ---------------------------------------------------------------------------
const ANIMATION_DURATION = 300;
const CARD_ELEVATION = 6;
const INPUT_BORDER_RADIUS = 30;

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState(user?.role === 'driver' ? 'post' : 'search');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [numberOfPersons, setNumberOfPersons] = useState('1');
  const [date, setDate] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);

  // -----------------------------------------------------------------------
  // Animations – fade‑in for cards and pop‑ups
  // -----------------------------------------------------------------------
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const triggerFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Trigger fade‑in on mount and when rides list changes
  useEffect(() => {
    triggerFadeIn();
  }, []);

  useEffect(() => {
    if (rides.length) triggerFadeIn();
  }, [rides]);

  // -----------------------------------------------------------------------
  // Effects
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (user?.role === 'passenger') checkActiveBookings();
  }, [user, refreshing]);

  useEffect(() => {
    if (user?.role) setActiveTab(user.role === 'driver' ? 'post' : 'search');
  }, [user?.role]);

  useEffect(() => {
    if (activeTab === 'search') loadRides();
  }, [activeTab]);

  // -----------------------------------------------------------------------
  // Data fetching helpers
  // -----------------------------------------------------------------------
  const checkActiveBookings = async () => {
    try {
      const { data = [] } = await bookingsAPI.getMyBookings();
      const confirmed = data.find(b => b.status === 'confirmed');
      setActiveBooking(confirmed);
    } catch (e) {
      console.error('Active booking check failed', e);
    }
  };

  const loadRides = async () => {
    setLoading(true);
    try {
      const params = {};
      if (origin) params.origin = origin;
      if (destination) params.destination = destination;
      if (date) params.date = format(date, 'yyyy-MM-dd');
      const { data = [] } = await ridesAPI.getAll(params);
      let filtered = data;
      if (numberOfPersons && parseInt(numberOfPersons) > 0) {
        const needed = parseInt(numberOfPersons);
        filtered = filtered.filter(r => (r.seatsAvailable - (r.bookedSeats || 0)) >= needed);
      }
      setRides(filtered);
    } catch (e) {
      console.error('Loading rides failed', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // -----------------------------------------------------------------------
  // UI interaction helpers
  // -----------------------------------------------------------------------
  const handleSearch = () => loadRides();
  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const handleCompleteRide = () => {
    if (!activeBooking) return;
    setShowPaymentSelection(true);
  };

  const confirmCompletion = async paymentMethod => {
    try {
      await bookingsAPI.complete(activeBooking._id, { paymentMethod });
      setActiveBooking(null);
      setShowPaymentSelection(false);
      Alert.alert('Success', 'Payment recorded. Ask driver to confirm completion.');
    } catch (e) {
      console.error('Completion error', e);
      Alert.alert('Error', 'Failed to complete ride');
    }
  };

  // -----------------------------------------------------------------------
  // Autocomplete for city fields
  // -----------------------------------------------------------------------
  const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi',
    'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur',
    'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad',
  ];

  const handleInputChange = (text, field) => {
    if (field === 'origin') setOrigin(text);
    if (field === 'destination') setDestination(text);
    if (text.length > 0) {
      const filtered = popularCities.filter(c => c.toLowerCase().includes(text.toLowerCase()));
      setSuggestions(filtered);
      setActiveField(field);
    } else {
      setSuggestions([]);
      setActiveField(null);
    }
  };

  const handleSelectSuggestion = city => {
    if (activeField === 'origin') setOrigin(city);
    if (activeField === 'destination') setDestination(city);
    setSuggestions([]);
    setActiveField(null);
  };

  const renderSuggestions = () => {
    if (!suggestions.length || !activeField) return null;
    const top = activeField === 'origin' ? 65 : 135;
    return (
      <View style={[styles.suggestionsContainer, { top }]}>
        <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 150 }}>
          {suggestions.map((item, i) => (
            <Pressable key={i} style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
              <Text style={styles.suggestionText}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  };

  // -----------------------------------------------------------------------
  // Ride card – glassmorphism style with fade‑in animation
  // -----------------------------------------------------------------------
  const renderRideItem = ({ item }) => {
    const availableSeats = (item.seatsAvailable || 0) - (item.bookedSeats || 0);
    const formattedDate = item?.departureTime ? format(new Date(item.departureTime), 'MMM dd, yyyy HH:mm') : 'TBD';
    return (
      <Animated.View style={{ opacity: fadeAnim, marginBottom: 12 }}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, elevation: CARD_ELEVATION }]}
          onPress={() => navigation.navigate('RideDetail', { rideId: item._id })}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={[styles.route, { color: theme.colors.text }]}>
                {item.origin?.address || 'Unknown'} → {item.destination?.address || 'Unknown'}
              </Text>
              <Chip mode="outlined" compact>{item.vehicleType || 'Car'}</Chip>
            </View>
            <View style={styles.cardDetails}>
              <Text variant="bodyMedium" style={{ color: theme.colors.text }}>📅 {formattedDate}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.text }}>💺 {availableSeats} seats</Text>
              <Text variant="titleLarge" style={[styles.price, { color: theme.colors.primary }]}>₹{item.pricePerSeat}/seat</Text>
            </View>
            {item.driverId && (
              <View style={styles.driverInfo}>
                <Text variant="bodySmall" style={{ color: theme.colors.placeholder }}>
                  👤 {item.driverId?.name || 'Unknown Driver'} ⭐ {item.driverId?.rating || 'N/A'}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ImageBackground source={require('../../../assets/bg1.jpg')} style={styles.bgImage} resizeMode="cover">
        <LinearGradient
          colors={[theme.colors.primary + 'AA', theme.colors.background + 'AA']}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {activeTab === 'search' ? (
            <>
              {/* Header */}
              <View style={styles.tabContainer}>
                <Text variant="headlineSmall" style={styles.headerText}>Passenger Mode</Text>
              </View>
              {/* Search Section */}
              <View style={[styles.searchSection, { zIndex: 1000 }]}>
                <View style={{ zIndex: activeField === 'origin' ? 1000 : 1 }}>
                  <TextInput
                    label="From"
                    value={origin}
                    onChangeText={t => handleInputChange(t, 'origin')}
                    onFocus={() => setActiveField('origin')}
                    mode="outlined"
                    left={<TextInput.Icon icon="map-marker" />}
                    style={styles.input}
                    theme={{ roundness: INPUT_BORDER_RADIUS }}
                  />
                </View>
                <View style={{ zIndex: activeField === 'destination' ? 1000 : 1 }}>
                  <TextInput
                    label="To"
                    value={destination}
                    onChangeText={t => handleInputChange(t, 'destination')}
                    onFocus={() => setActiveField('destination')}
                    mode="outlined"
                    left={<TextInput.Icon icon="map-marker-check" />}
                    style={styles.input}
                    theme={{ roundness: INPUT_BORDER_RADIUS }}
                  />
                </View>
                {renderSuggestions()}
                <TextInput
                  label="Number of Persons"
                  value={numberOfPersons}
                  onChangeText={setNumberOfPersons}
                  keyboardType="numeric"
                  style={styles.input}
                  left={<TextInput.Icon icon="account-multiple" />}
                  theme={{ roundness: INPUT_BORDER_RADIUS }}
                />
                <Pressable onPress={() => setDatePickerVisible(true)}>
                  <TextInput
                    label="Date"
                    value={date ? format(date, 'MMM dd, yyyy') : ''}
                    editable={false}
                    style={styles.input}
                    left={<TextInput.Icon icon="calendar" />}
                    theme={{ roundness: INPUT_BORDER_RADIUS }}
                  />
                </Pressable>
                <Button
                  mode="elevated"
                  onPress={handleSearch}
                  loading={loading}
                  style={styles.searchButton}
                  icon="magnify"
                  buttonColor={theme.colors.primary}
                  textColor="#fff"
                  contentStyle={{ height: 48 }}
                  labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                >
                  Search Rides
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Bookings')}
                  style={styles.myBookingsButton}
                  icon="calendar-check"
                  textColor={theme.colors.primary}
                  contentStyle={{ height: 40 }}
                  labelStyle={{ fontSize: 14, fontWeight: '600' }}
                >
                  My Bookings
                </Button>
              </View>
              {/* Ride List */}
              <FlatList
                data={rides}
                renderItem={renderRideItem}
                keyExtractor={(item, i) => item?._id?.toString() || i.toString()}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge" style={{ color: theme.colors.placeholder }}>
                      {loading ? 'Loading rides...' : 'No rides found. Try different criteria.'}
                    </Text>
                  </View>
                }
              />
            </>
          ) : (
            // Driver Mode UI
            <ScrollView style={styles.postScroll} contentContainerStyle={styles.postContainer} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              <View style={styles.tabContainer}>
                <Text variant="headlineSmall" style={styles.headerText}>Driver Mode</Text>
              </View>
              <Card style={[styles.postCard, { backgroundColor: theme.colors.surface, elevation: CARD_ELEVATION }]}>
                <Card.Content>
                  <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text }]}>Post a Ride</Text>
                  <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.placeholder }]}>Share your ride and earn money by taking passengers along</Text>
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('PostRideCommon')}
                    style={styles.postButton}
                    icon="plus-circle"
                    contentStyle={{ height: 56 }}
                    labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
                  >
                    Post New Ride
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('MyRides')}
                    style={styles.myRidesButton}
                    icon="car"
                    contentStyle={{ height: 48 }}
                    labelStyle={{ fontSize: 16, fontWeight: '600' }}
                  >
                    View My Rides
                  </Button>
                </Card.Content>
              </Card>
              <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface, elevation: CARD_ELEVATION }]}>
                <Card.Content>
                  <Text variant="titleMedium" style={[styles.infoTitle, { color: theme.colors.text }]}>💡 Tips for Posting Rides</Text>
                  <View style={styles.tipsList}>
                    <Text style={[styles.tip, { color: theme.colors.text }]}>• Set a fair price per seat</Text>
                    <Text style={[styles.tip, { color: theme.colors.text }]}>• Be accurate with departure time</Text>
                    <Text style={[styles.tip, { color: theme.colors.text }]}>• Update available seats regularly</Text>
                    <Text style={[styles.tip, { color: theme.colors.text }]}>• Respond to booking requests promptly</Text>
                  </View>
                </Card.Content>
              </Card>
            </ScrollView>
          )}
          {/* Date Picker */}
          {datePickerVisible && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selected) => {
                if (Platform.OS === 'android') {
                  setDatePickerVisible(false);
                  if (event.type === 'set' && selected) setDate(selected);
                } else {
                  if (event.type === 'set' && selected) {
                    setDate(selected);
                    setDatePickerVisible(false);
                  } else if (event.type === 'dismissed') {
                    setDatePickerVisible(false);
                  }
                }
              }}
              minimumDate={new Date()}
            />
          )}
          {/* Active Booking Popup */}
          {activeBooking && !showPaymentSelection && (
            <Animated.View style={[styles.activeBookingPopup, { opacity: fadeAnim }]}>
              <Card style={styles.activeBookingCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.popupTitle}>Ride in Progress</Text>
                  <Text variant="bodyMedium" style={styles.popupText}>
                    {activeBooking.rideId?.origin?.address || 'Unknown'} → {activeBooking.rideId?.destination?.address || 'Unknown'}
                  </Text>
                  <Button mode="contained" onPress={handleCompleteRide} style={styles.completeRideButton} icon="check-circle" buttonColor="#4caf50">
                    Complete Ride
                  </Button>
                </Card.Content>
              </Card>
            </Animated.View>
          )}
          {/* Payment Selection Popup */}
          {showPaymentSelection && (
            <Animated.View style={[styles.activeBookingPopup, { opacity: fadeAnim }]}>
              <Card style={styles.activeBookingCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.popupTitle}>Select Payment Method</Text>
                  <Text variant="bodyMedium" style={{ marginBottom: 16 }}>How did you pay for this ride?</Text>
                  <View style={{ gap: 12 }}>
                    <Button mode="contained" onPress={() => confirmCompletion('Online Transfer')} style={{ borderRadius: 8, backgroundColor: '#2196f3' }} icon="bank-transfer">
                      Online Transfer
                    </Button>
                    <Button mode="contained" onPress={() => confirmCompletion('Cash on Delivery')} style={{ borderRadius: 8, backgroundColor: '#4caf50' }} icon="cash">
                      Cash on Delivery
                    </Button>
                    <Button mode="text" onPress={() => setShowPaymentSelection(false)} textColor="#666">
                      Cancel
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    paddingTop: 30,
    paddingBottom: 5,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(98,0,238,0.9)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    marginBottom: 16,
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    fontSize: 20,
  },
  searchSection: {
    margin: 11,
    padding: 15,
    borderRadius: 45,
    elevation: 4,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  searchButton: {
    marginTop: 2,
    marginBottom: 8,
    borderRadius: 30,
    elevation: 4,
  },
  myBookingsButton: {
    marginBottom: 2,
    borderRadius: 30,
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  list: { padding: 16 },
  card: { marginVertical: 8, borderRadius: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  route: { flex: 1, fontWeight: 'bold' },
  cardDetails: { marginTop: 4 },
  price: { fontWeight: 'bold', marginTop: 4 },
  driverInfo: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  postScroll: {},
  postContainer: { padding: 16 },
  postCard: { marginBottom: 16, borderRadius: 12 },
  title: { fontWeight: 'bold', marginBottom: 8 },
  subtitle: { marginBottom: 20 },
  postButton: { marginBottom: 16, backgroundColor: '#6acffb', borderRadius: 12, elevation: 6 },
  myRidesButton: { marginBottom: 8, borderRadius: 12, borderWidth: 2 },
  infoCard: { elevation: 2 },
  infoTitle: { fontWeight: 'bold', marginBottom: 12 },
  tipsList: { marginLeft: 8 },
  tip: { marginBottom: 8, lineHeight: 24 },
  bgImage: { flex: 1, resizeMode: 'cover' },
  suggestionsContainer: { position: 'absolute', left: 15, right: 15, backgroundColor: 'white', borderRadius: 8, elevation: 5, zIndex: 2000, borderWidth: 1, borderColor: '#e0e0e0' },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  suggestionText: { fontSize: 16, color: '#333' },
  activeBookingPopup: { position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 2000 },
  activeBookingCard: { backgroundColor: '#fff', elevation: 8, borderRadius: 16, borderLeftWidth: 6, borderLeftColor: '#4caf50' },
  popupTitle: { fontWeight: 'bold', color: '#4caf50', marginBottom: 4 },
  popupText: { marginBottom: 12, color: '#333' },
  completeRideButton: { borderRadius: 8 },
});
