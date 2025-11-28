// ManageRideScreen.js – Enhanced UI with Glassmorphism & Animations
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  ImageBackground,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
  Avatar,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { ridesAPI, bookingsAPI } from '../../services/api';
import { format } from 'date-fns';
import driverTheme from '../../theme/driverTheme';

const { width } = Dimensions.get('window');

export default function ManageRideScreen({ route, navigation }) {
  const rideId = route.params?.rideId;
  const [ride, setRide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP dialog state
  const [otpDialogVisible, setOtpDialogVisible] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load ride & bookings on mount
  useEffect(() => {
    if (rideId) {
      loadRideDetails();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      setLoading(false);
      Alert.alert('Error', 'Invalid Ride ID');
      navigation.goBack();
    }
  }, [rideId]);

  // Poll for updates
  useEffect(() => {
    if (!rideId) return;
    const interval = setInterval(() => {
      loadRideDetails(true); // Silent update
    }, 5000);
    return () => clearInterval(interval);
  }, [rideId]);

  const loadRideDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [rideRes, bookingsRes] = await Promise.all([
        ridesAPI.getById(rideId),
        ridesAPI.getRideBookings(rideId),
      ]);
      setRide(rideRes.data);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error('Error loading ride:', error);
      if (!silent) Alert.alert('Error', 'Failed to load ride details');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Auto-navigate to PaymentConfirmation when payment_processing booking is detected
  useEffect(() => {
    const paymentProcessingBooking = bookings.find(b => b?.status === 'payment_processing');
    if (paymentProcessingBooking) {
      navigation.navigate('PaymentConfirmation', {
        booking: paymentProcessingBooking,
        rideId: rideId
      });
    }
  }, [bookings]);

  // OTP countdown timer
  useEffect(() => {
    let timerId;
    if (otpDialogVisible && otpTimer > 0) {
      timerId = setTimeout(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timerId);
  }, [otpDialogVisible, otpTimer]);

  const handleResendOtp = () => {
    setOtpTimer(60);
    setOtpDigits(Array(6).fill(''));
    setTimeout(() => otpRefs[0].current?.focus(), 100);
    Alert.alert('Info', 'A new verification code has been sent.');
  };

  const handleAcceptBooking = async bookingId => {
    try {
      await bookingsAPI.accept(bookingId);
      loadRideDetails();
      Alert.alert('Success', 'Booking accepted! Ask passenger for verification code.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to accept booking';
      Alert.alert('Error', msg);
    }
  };

  const handleVerifyBooking = bookingId => {
    setCurrentBookingId(bookingId);
    setOtpDigits(Array(6).fill(''));
    setOtpDialogVisible(true);
    setOtpTimer(60);
    setTimeout(() => otpRefs[0].current?.focus(), 100);
  };

  const handleOtpSubmit = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6‑digit code');
      return;
    }
    setVerifying(true);
    try {
      await bookingsAPI.verify(currentBookingId, code);
      setOtpDialogVisible(false);
      setOtpDigits(Array(6).fill(''));
      loadRideDetails();
      Alert.alert('Success', 'Ride confirmed! You can now start the journey.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid verification code';
      Alert.alert('Verification Failed', msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelBooking = async bookingId => {
    Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            await bookingsAPI.cancel(bookingId);
            loadRideDetails();
            Alert.alert('Success', 'Booking rejected');
          } catch (error) {
            Alert.alert('Error', 'Failed to reject booking');
          }
        },
      },
    ]);
  };

  const handleMessagePassenger = (passengerId, passengerName) => {
    navigation.navigate('Chat', {
      userId: passengerId,
      userName: passengerName,
      rideId: ride?._id,
    });
  };

  const getStatusColor = status => {
    switch (status) {
      case 'confirmed': return { bg: '#4caf50', text: '#fff', icon: 'check-circle' };
      case 'accepted': return { bg: '#00bcd4', text: '#fff', icon: 'clock-check' };
      case 'registered': return { bg: '#2196f3', text: '#fff', icon: 'account-plus' };
      case 'pending': return { bg: '#ff9800', text: '#fff', icon: 'clock-outline' };
      case 'canceled': return { bg: '#f44336', text: '#fff', icon: 'close-circle' };
      case 'completed': return { bg: '#9e9e9e', text: '#fff', icon: 'flag-checkered' };
      case 'payment_processing': return { bg: '#9c27b0', text: '#fff', icon: 'credit-card-clock' };
      default: return { bg: '#666', text: '#fff', icon: 'help-circle' };
    }
  };

  const renderBookingItem = ({ item, index }) => {
    if (!item) return null;
    const statusColor = getStatusColor(item.status);

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <Card style={styles.bookingCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
            style={styles.cardGradient}
          >
            <Card.Content>
              <View style={styles.bookingHeader}>
                <View style={styles.passengerInfo}>
                  <Avatar.Text
                    size={48}
                    label={item.passengerId?.name?.charAt(0).toUpperCase() || 'P'}
                    style={styles.avatar}
                    color="#fff"
                  />
                  <View style={styles.passengerDetails}>
                    <Text variant="titleMedium" style={styles.passengerName}>
                      {item.passengerId?.name || 'Unknown Passenger'}
                    </Text>
                    <Text variant="bodySmall" style={styles.passengerEmail}>
                      {item.passengerId?.email || ''}
                    </Text>
                  </View>
                </View>
                <Chip
                  mode="flat"
                  icon={statusColor.icon}
                  style={{ backgroundColor: statusColor.bg + '20' }}
                  textStyle={{ color: statusColor.bg, fontWeight: 'bold', fontSize: 11 }}
                  compact
                >
                  {item.status ? item.status.toUpperCase() : 'UNKNOWN'}
                </Chip>
              </View>

              <Divider style={styles.bookingDivider} />

              <View style={styles.bookingDetailsGrid}>
                <View style={styles.detailItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
                    <Avatar.Icon size={20} icon="seat-passenger" color="#2196f3" style={{ backgroundColor: 'transparent' }} />
                  </View>
                  <View>
                    <Text variant="labelSmall" style={styles.detailLabel}>Seats</Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>{item.seatsBooked || 0}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#fff8e1' }]}>
                    <Avatar.Icon size={20} icon="cash" color="#ffc107" style={{ backgroundColor: 'transparent' }} />
                  </View>
                  <View>
                    <Text variant="labelSmall" style={styles.detailLabel}>Amount</Text>
                    <Text variant="bodyMedium" style={styles.detailValue}>₹{item.totalAmount || 0}</Text>
                  </View>
                </View>
              </View>

              <Text variant="bodySmall" style={styles.timestamp}>
                Booked on {item.createdAt ? format(new Date(item.createdAt), 'MMM dd, yyyy • hh:mm a') : 'N/A'}
              </Text>

              {item.passengerDetails && Object.keys(item.passengerDetails).length > 0 && (
                <View style={styles.passengerDetailsSection}>
                  <Divider style={styles.bookingDivider} />
                  <Text variant="titleSmall" style={styles.passengerDetailsTitle}>Passenger Information</Text>

                  {item.passengerDetails.contactNumber && (
                    <View style={styles.infoRow}>
                      <Avatar.Icon size={24} icon="phone" style={styles.miniIcon} color="#fff" />
                      <Text variant="bodyMedium" style={styles.infoText}>{item.passengerDetails.contactNumber}</Text>
                    </View>
                  )}

                  {(item.passengerDetails.numberOfAdults > 0 || item.passengerDetails.numberOfChildren > 0) && (
                    <View style={styles.infoRow}>
                      <Avatar.Icon size={24} icon="account-group" style={styles.miniIcon} color="#fff" />
                      <Text variant="bodyMedium" style={styles.infoText}>
                        {item.passengerDetails.numberOfAdults || 0} Adult(s), {item.passengerDetails.numberOfChildren || 0} Child(ren)
                      </Text>
                    </View>
                  )}

                  {item.passengerDetails.luggage && item.passengerDetails.luggage !== 'none' && (
                    <View style={styles.infoRow}>
                      <Avatar.Icon size={24} icon="bag-suitcase" style={styles.miniIcon} color="#fff" />
                      <Text variant="bodyMedium" style={styles.infoText}>
                        Luggage: {item.passengerDetails.luggage.charAt(0).toUpperCase() + item.passengerDetails.luggage.slice(1)}
                      </Text>
                    </View>
                  )}

                  {item.passengerDetails.emergencyContact?.name && (
                    <View style={styles.emergencyContactBox}>
                      <Text variant="labelSmall" style={styles.emergencyLabel}>Emergency Contact</Text>
                      <Text variant="bodySmall" style={styles.emergencyText}>
                        {item.passengerDetails.emergencyContact.name}
                        {item.passengerDetails.emergencyContact.relation && ` (${item.passengerDetails.emergencyContact.relation})`}
                      </Text>
                      {item.passengerDetails.emergencyContact.phone && (
                        <Text variant="bodySmall" style={styles.emergencyText}>📞 {item.passengerDetails.emergencyContact.phone}</Text>
                      )}
                    </View>
                  )}

                  {item.passengerDetails.specialRequirements?.trim() && (
                    <View style={styles.specialRequirementsBox}>
                      <Text variant="labelSmall" style={styles.specialLabel}>Special Requirements</Text>
                      <Text variant="bodySmall" style={styles.specialText}>{item.passengerDetails.specialRequirements}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.actionButtonsContainer}>
                {item.status === 'registered' && (
                  <>
                    <Button mode="contained" onPress={() => handleAcceptBooking(item._id)} style={[styles.actionButton, styles.acceptButton]} icon="check">
                      Accept
                    </Button>
                    <Button mode="outlined" onPress={() => handleCancelBooking(item._id)} style={[styles.actionButton, styles.rejectButton]} textColor="#f44336" icon="close">
                      Reject
                    </Button>
                  </>
                )}
                {item.status === 'accepted' && (
                  <>
                    <Button mode="contained" onPress={() => handleVerifyBooking(item._id)} style={[styles.actionButton, styles.verifyButton]} icon="shield-check">
                      Verify OTP
                    </Button>
                    <Button mode="outlined" onPress={() => handleCancelBooking(item._id)} style={[styles.actionButton, styles.rejectButton]} textColor="#f44336" icon="close">
                      Reject
                    </Button>
                  </>
                )}
                {item.status === 'confirmed' && item.passengerId && (
                  <Button mode="outlined" onPress={() => handleMessagePassenger(item.passengerId._id, item.passengerId.name)} style={styles.messageButton} icon="message-text" textColor="#6200ee">
                    Message Passenger
                  </Button>
                )}
              </View>
            </Card.Content>
          </LinearGradient>
        </Card>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.centerContainer}>
        <Text>Ride not found</Text>
      </View>
    );
  }

  const availableSeats = ride?.seatsAvailable && ride?.bookedSeats !== undefined ? ride.seatsAvailable - ride.bookedSeats : 0;
  const formattedDate = ride?.departureTime ? format(new Date(ride.departureTime), 'MMM dd, yyyy') : 'N/A';
  const formattedTime = ride?.departureTime ? format(new Date(ride.departureTime), 'hh:mm a') : 'N/A';
  const confirmedBookings = Array.isArray(bookings) ? bookings.filter(b => b?.status === 'confirmed').length : 0;
  const pendingBookings = Array.isArray(bookings) ? bookings.filter(b => b?.status === 'pending' || b?.status === 'registered' || b?.status === 'accepted').length : 0;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/bg1.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Ride Details Card */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}>
            <Card style={styles.rideCard}>
              <LinearGradient
                colors={['#ffffff', '#f8f9fa']}
                style={styles.cardGradient}
              >
                <Card.Content>
                  <View style={styles.rideHeader}>
                    <View style={styles.routeContainer}>
                      <View style={styles.routeItem}>
                        <View style={[styles.dot, { backgroundColor: '#4caf50' }]} />
                        <Text variant="titleMedium" style={styles.routeText}>{ride?.origin?.address}</Text>
                      </View>
                      <View style={styles.routeLine} />
                      <View style={styles.routeItem}>
                        <View style={[styles.dot, { backgroundColor: '#f44336' }]} />
                        <Text variant="titleMedium" style={styles.routeText}>{ride?.destination?.address}</Text>
                      </View>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.rideDetailsGrid}>
                    <View style={styles.rideDetailItem}>
                      <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
                        <Avatar.Icon size={24} icon="calendar" color="#4caf50" style={{ backgroundColor: 'transparent' }} />
                      </View>
                      <View>
                        <Text style={styles.rideDetailLabel}>Date</Text>
                        <Text style={styles.rideDetailValue}>{formattedDate}</Text>
                      </View>
                    </View>
                    <View style={styles.rideDetailItem}>
                      <View style={[styles.iconBox, { backgroundColor: '#e3f2fd' }]}>
                        <Avatar.Icon size={24} icon="clock-outline" color="#2196f3" style={{ backgroundColor: 'transparent' }} />
                      </View>
                      <View>
                        <Text style={styles.rideDetailLabel}>Time</Text>
                        <Text style={styles.rideDetailValue}>{formattedTime}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.rideDetailsGrid, { marginTop: 16 }]}>
                    <View style={styles.rideDetailItem}>
                      <View style={[styles.iconBox, { backgroundColor: '#fff3e0' }]}>
                        <Avatar.Icon size={24} icon="seat-recline-normal" color="#ff9800" style={{ backgroundColor: 'transparent' }} />
                      </View>
                      <View>
                        <Text style={styles.rideDetailLabel}>Available</Text>
                        <Text style={styles.rideDetailValue}>{availableSeats} Seats</Text>
                      </View>
                    </View>
                    <View style={styles.rideDetailItem}>
                      <View style={[styles.iconBox, { backgroundColor: '#f3e5f5' }]}>
                        <Avatar.Icon size={24} icon="cash" color="#9c27b0" style={{ backgroundColor: 'transparent' }} />
                      </View>
                      <View>
                        <Text style={styles.rideDetailLabel}>Price</Text>
                        <Text style={styles.rideDetailValue}>₹{ride?.pricePerSeat}/seat</Text>
                      </View>
                    </View>
                  </View>

                  {ride?.description && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionLabel}>Notes</Text>
                      <Text style={styles.description}>{ride.description}</Text>
                    </View>
                  )}
                </Card.Content>
              </LinearGradient>
            </Card>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: 20 }] }}>
            <Card style={styles.statsCard}>
              <Card.Content>
                <Text style={styles.sectionHeader}>Booking Overview</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{bookings?.length || 0}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#4caf50' }]}>{confirmedBookings}</Text>
                    <Text style={styles.statLabel}>Confirmed</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#ff9800' }]}>{pendingBookings}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Bookings List */}
          <View style={styles.bookingsSection}>
            <Text style={styles.sectionTitle}>Passenger Bookings</Text>
            {(!bookings || bookings.length === 0) ? (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <View style={styles.emptyIconContainer}>
                    <Avatar.Icon size={64} icon="account-group-outline" style={{ backgroundColor: 'transparent' }} color="#fff" />
                  </View>
                  <Text style={styles.emptyTitle}>No bookings yet</Text>
                  <Text style={styles.emptyText}>Passengers will appear here once they book your ride</Text>
                </Card.Content>
              </Card>
            ) : (
              <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item, index) => item?._id || `booking-${index}`}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>

        {/* OTP Dialog */}
        <Portal>
          <Dialog visible={otpDialogVisible} onDismiss={() => setOtpDialogVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Verify Passenger</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Enter the 6‑digit verification code sent by the passenger.
              </Text>
              {otpDialogVisible && otpTimer > 0 && (
                <Text style={styles.timerText}>
                  Code expires in {otpTimer}s
                </Text>
              )}
              <View style={styles.otpContainer}>
                {otpDigits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={otpRefs[idx]}
                    mode="outlined"
                    value={digit}
                    onChangeText={text => {
                      const clean = text.replace(/[^0-9]/g, '');
                      const newDigits = [...otpDigits];
                      newDigits[idx] = clean;
                      setOtpDigits(newDigits);
                      if (clean && idx < 5) {
                        otpRefs[idx + 1].current?.focus();
                      }
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
                        otpRefs[idx - 1].current?.focus();
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={1}
                    style={styles.otpInput}
                    outlineColor="#e0e0e0"
                    activeOutlineColor="#6200ee"
                  />
                ))}
              </View>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <Button onPress={() => setOtpDialogVisible(false)} disabled={verifying} textColor="#666">Cancel</Button>
              <Button onPress={handleResendOtp} disabled={verifying || otpTimer > 0} textColor="#6200ee">Resend</Button>
              <Button mode="contained" onPress={handleOtpSubmit} loading={verifying} disabled={verifying || otpDigits.some(d => d === '')} style={styles.verifyDialogButton}>Verify</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: width },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },

  // Ride Card
  rideCard: {
    margin: 16,
    borderRadius: 24,
    elevation: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  cardGradient: { padding: 4 },
  rideHeader: { marginBottom: 8 },
  routeContainer: { paddingVertical: 8 },
  routeItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeLine: { width: 2, height: 24, backgroundColor: '#e0e0e0', marginLeft: 7, marginVertical: 4 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#fff', elevation: 2 },
  routeText: { fontWeight: 'bold', color: '#1a1a1a', fontSize: 16, flex: 1 },

  divider: { backgroundColor: 'rgba(0,0,0,0.05)', height: 1, marginVertical: 16 },

  rideDetailsGrid: { flexDirection: 'row', gap: 16 },
  rideDetailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rideDetailLabel: { color: '#666', fontSize: 12, fontWeight: '600' },
  rideDetailValue: { fontWeight: 'bold', color: '#1a1a1a', fontSize: 15 },

  descriptionContainer: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 16, marginTop: 20 },
  descriptionLabel: { fontWeight: 'bold', color: '#6200ee', marginBottom: 4, fontSize: 12 },
  description: { color: '#333', lineHeight: 20 },

  // Stats Card
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    elevation: 4,
    backgroundColor: '#fff',
  },
  sectionHeader: { fontWeight: 'bold', fontSize: 16, color: '#1a1a1a', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#e0e0e0' },

  // Bookings Section
  bookingsSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

  // Booking Card
  bookingCard: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  passengerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { backgroundColor: '#6200ee' },
  passengerDetails: { flex: 1 },
  passengerName: { fontWeight: 'bold', color: '#1a1a1a', fontSize: 16 },
  passengerEmail: { color: '#666', fontSize: 12 },

  bookingDivider: { backgroundColor: 'rgba(0,0,0,0.05)', height: 1, marginVertical: 12 },

  bookingDetailsGrid: { flexDirection: 'row', gap: 16 },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { color: '#666', fontSize: 11, fontWeight: '600' },
  detailValue: { fontWeight: 'bold', color: '#1a1a1a', fontSize: 14 },

  timestamp: { color: '#999', fontSize: 11, marginTop: 12, textAlign: 'right' },

  passengerDetailsSection: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 12, marginTop: 12 },
  passengerDetailsTitle: { fontWeight: 'bold', color: '#6200ee', marginBottom: 12, fontSize: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  miniIcon: { backgroundColor: '#6200ee' },
  infoText: { color: '#333', fontSize: 13, flex: 1 },

  emergencyContactBox: { backgroundColor: 'rgba(255,152,0,0.1)', padding: 12, borderRadius: 8, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#ff9800' },
  emergencyLabel: { color: '#ff9800', fontWeight: 'bold', fontSize: 11, marginBottom: 2 },
  emergencyText: { color: '#333', fontSize: 12 },

  specialRequirementsBox: { backgroundColor: 'rgba(76,175,80,0.1)', padding: 12, borderRadius: 8, marginTop: 8, borderLeftWidth: 3, borderLeftColor: '#4caf50' },
  specialLabel: { color: '#4caf50', fontWeight: 'bold', fontSize: 11, marginBottom: 2 },
  specialText: { color: '#333', fontSize: 12 },

  actionButtonsContainer: { marginTop: 16, gap: 8 },
  actionButton: { borderRadius: 12, flex: 1 },
  acceptButton: { backgroundColor: '#4caf50' },
  rejectButton: { borderColor: '#f44336', borderWidth: 1 },
  verifyButton: { backgroundColor: '#6200ee' },
  messageButton: { borderColor: '#6200ee', borderWidth: 1, marginTop: 8 },

  // Empty State
  emptyCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20 },
  emptyContent: { alignItems: 'center' },
  emptyIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  emptyText: { color: '#666', textAlign: 'center' },

  // Dialog
  dialog: { borderRadius: 20, backgroundColor: '#fff' },
  dialogTitle: { textAlign: 'center', fontWeight: 'bold', color: '#6200ee' },
  dialogText: { textAlign: 'center', color: '#333', marginBottom: 16 },
  timerText: { textAlign: 'center', color: '#f44336', fontSize: 12, marginBottom: 16 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  otpInput: { width: 40, height: 48, textAlign: 'center', fontSize: 20, backgroundColor: '#fff' },
  dialogActions: { justifyContent: 'space-around', paddingBottom: 16 },
  verifyDialogButton: { backgroundColor: '#6200ee', paddingHorizontal: 16 },
});
